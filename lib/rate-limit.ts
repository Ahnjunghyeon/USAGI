type Bucket = {
  minuteStart: number;
  minuteCount: number;
  hourStart: number;
  hourCount: number;
  dayStart: number;
  dayCount: number;
  touchedAt: number;
};

type ActiveLock = { expiresAt: number };

const buckets = new Map<string, Bucket>();
const activeLocks = new Map<string, ActiveLock>();
let globalDayStart = 0;
let globalDayCount = 0;
let lastCleanup = 0;

const MINUTE_LIMIT = Number(process.env.USAGI_IP_MINUTE_LIMIT || 2);
const HOUR_LIMIT = Number(process.env.USAGI_IP_HOUR_LIMIT || 5);
const DAY_LIMIT = Number(process.env.USAGI_IP_DAILY_LIMIT || 10);
const GLOBAL_DAY_LIMIT = Number(process.env.USAGI_GLOBAL_DAILY_LIMIT || 100);
const MEMORY_TTL = 26 * 60 * 60 * 1000;
const ACTIVE_TTL_SECONDS = 90;

function nowBucket(now: number, sizeMs: number) { return Math.floor(now / sizeMs) * sizeMs; }
function dayBucket(now: number) { return nowBucket(now, 86_400_000); }

export function getClientKey(request: Request) {
  const vercelIp = request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim();
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = request.headers.get("x-real-ip")?.trim();
  return vercelIp || forwarded || realIp || "unknown";
}

export function hasDistributedRateLimit() {
  return Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}

export function requiresDistributedGuard() {
  return process.env.USAGI_REQUIRE_DISTRIBUTED_GUARD === "true";
}

function cleanupMemory(now: number) {
  if (now - lastCleanup < 10 * 60 * 1000) return;
  lastCleanup = now;
  for (const [key, value] of buckets) if (now - value.touchedAt > MEMORY_TTL) buckets.delete(key);
  for (const [key, value] of activeLocks) if (value.expiresAt <= now) activeLocks.delete(key);
}

function consumeMemoryRateLimit(key: string) {
  const now = Date.now();
  cleanupMemory(now);
  const minuteStart = nowBucket(now, 60_000);
  const hourStart = nowBucket(now, 3_600_000);
  const dayStart = dayBucket(now);
  const bucket = buckets.get(key) ?? { minuteStart, minuteCount: 0, hourStart, hourCount: 0, dayStart, dayCount: 0, touchedAt: now };
  if (bucket.minuteStart !== minuteStart) { bucket.minuteStart = minuteStart; bucket.minuteCount = 0; }
  if (bucket.hourStart !== hourStart) { bucket.hourStart = hourStart; bucket.hourCount = 0; }
  if (bucket.dayStart !== dayStart) { bucket.dayStart = dayStart; bucket.dayCount = 0; }
  bucket.touchedAt = now;
  if (bucket.minuteCount >= MINUTE_LIMIT || bucket.hourCount >= HOUR_LIMIT || bucket.dayCount >= DAY_LIMIT) {
    const retryAfter = bucket.minuteCount >= MINUTE_LIMIT
      ? Math.max(1, Math.ceil((minuteStart + 60_000 - now) / 1000))
      : bucket.hourCount >= HOUR_LIMIT
        ? Math.max(1, Math.ceil((hourStart + 3_600_000 - now) / 1000))
        : Math.max(1, Math.ceil((dayStart + 86_400_000 - now) / 1000));
    return { ok: false as const, retryAfter, reason: "client_limit" as const, source: "memory" as const };
  }
  bucket.minuteCount += 1;
  bucket.hourCount += 1;
  bucket.dayCount += 1;
  buckets.set(key, bucket);
  return { ok: true as const, source: "memory" as const };
}

async function upstashCommand(command: Array<string | number>) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  const response = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(command),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`RATE_LIMIT_STORE_${response.status}`);
  return response.json() as Promise<{ result?: unknown }>;
}

async function incrementWindow(key: string, ttl: number) {
  const response = await upstashCommand(["INCR", key]);
  const count = Number(response?.result ?? 0);
  if (count === 1) await upstashCommand(["EXPIRE", key, ttl]);
  return count;
}

async function consumeDistributedRateLimit(key: string) {
  if (!hasDistributedRateLimit()) return null;
  const now = Date.now();
  const minuteStart = nowBucket(now, 60_000);
  const hourStart = nowBucket(now, 3_600_000);
  const dayStart = dayBucket(now);
  const safeKey = encodeURIComponent(key).slice(0, 160);
  const [minuteCount, hourCount, dayCount] = await Promise.all([
    incrementWindow(`usagi:rl:m:${minuteStart}:${safeKey}`, 70),
    incrementWindow(`usagi:rl:h:${hourStart}:${safeKey}`, 3700),
    incrementWindow(`usagi:rl:d:${dayStart}:${safeKey}`, 90000),
  ]);
  if (minuteCount > MINUTE_LIMIT || hourCount > HOUR_LIMIT || dayCount > DAY_LIMIT) {
    const retryAfter = minuteCount > MINUTE_LIMIT
      ? Math.max(1, Math.ceil((minuteStart + 60_000 - now) / 1000))
      : hourCount > HOUR_LIMIT
        ? Math.max(1, Math.ceil((hourStart + 3_600_000 - now) / 1000))
        : Math.max(1, Math.ceil((dayStart + 86_400_000 - now) / 1000));
    return { ok: false as const, retryAfter, reason: "client_limit" as const, source: "upstash" as const };
  }
  return { ok: true as const, source: "upstash" as const };
}

async function consumeGlobalDailyBudget() {
  const now = Date.now();
  const start = dayBucket(now);
  if (hasDistributedRateLimit()) {
    const count = await incrementWindow(`usagi:budget:d:${start}`, 90000);
    return count <= GLOBAL_DAY_LIMIT;
  }
  if (globalDayStart !== start) { globalDayStart = start; globalDayCount = 0; }
  globalDayCount += 1;
  return globalDayCount <= GLOBAL_DAY_LIMIT;
}

export async function consumeRateLimit(key: string) {
  try {
    const distributed = await consumeDistributedRateLimit(key);
    if (distributed) return distributed;
  } catch (error) {
    console.error("[usagi/rate-limit] distributed store failed", error);
    if (requiresDistributedGuard()) return { ok: false as const, retryAfter: 60, reason: "guard_unavailable" as const, source: "upstash" as const };
  }
  if (requiresDistributedGuard() && !hasDistributedRateLimit()) {
    return { ok: false as const, retryAfter: 60, reason: "guard_unavailable" as const, source: "memory" as const };
  }
  return consumeMemoryRateLimit(key);
}

export async function acquireAnalysisSlot(key: string) {
  const safeKey = encodeURIComponent(key).slice(0, 160);
  if (hasDistributedRateLimit()) {
    const response = await upstashCommand(["SET", `usagi:active:${safeKey}`, "1", "NX", "EX", ACTIVE_TTL_SECONDS]);
    const acquired = response?.result === "OK";
    return { ok: acquired, source: "upstash" as const };
  }
  const now = Date.now();
  cleanupMemory(now);
  const existing = activeLocks.get(key);
  if (existing && existing.expiresAt > now) return { ok: false, source: "memory" as const };
  activeLocks.set(key, { expiresAt: now + ACTIVE_TTL_SECONDS * 1000 });
  return { ok: true, source: "memory" as const };
}

export async function releaseAnalysisSlot(key: string) {
  const safeKey = encodeURIComponent(key).slice(0, 160);
  if (hasDistributedRateLimit()) {
    try { await upstashCommand(["DEL", `usagi:active:${safeKey}`]); } catch (error) { console.error("[usagi/rate-limit] release failed", error); }
    return;
  }
  activeLocks.delete(key);
}

export async function consumeGlobalBudget() {
  try {
    const ok = await consumeGlobalDailyBudget();
    return { ok, limit: GLOBAL_DAY_LIMIT };
  } catch (error) {
    console.error("[usagi/budget] store failed", error);
    if (requiresDistributedGuard()) return { ok: false, limit: GLOBAL_DAY_LIMIT };
    return { ok: true, limit: GLOBAL_DAY_LIMIT };
  }
}

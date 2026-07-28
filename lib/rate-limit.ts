type Bucket = { minuteStart: number; minuteCount: number; hourStart: number; hourCount: number; touchedAt: number };
const buckets = new Map<string, Bucket>();
const MINUTE_LIMIT = 3;
const HOUR_LIMIT = 20;
const MEMORY_TTL = 2 * 60 * 60 * 1000;
let lastCleanup = 0;

function nowBucket(now: number, sizeMs: number) { return Math.floor(now / sizeMs) * sizeMs; }

export function getClientKey(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = request.headers.get("x-real-ip")?.trim();
  return forwarded || realIp || "unknown";
}

function cleanupMemory(now: number) {
  if (now - lastCleanup < 10 * 60 * 1000) return;
  lastCleanup = now;
  for (const [key, value] of buckets) if (now - value.touchedAt > MEMORY_TTL) buckets.delete(key);
}

function consumeMemoryRateLimit(key: string) {
  const now = Date.now();
  cleanupMemory(now);
  const minuteStart = nowBucket(now, 60_000);
  const hourStart = nowBucket(now, 3_600_000);
  const bucket = buckets.get(key) ?? { minuteStart, minuteCount: 0, hourStart, hourCount: 0, touchedAt: now };
  if (bucket.minuteStart !== minuteStart) { bucket.minuteStart = minuteStart; bucket.minuteCount = 0; }
  if (bucket.hourStart !== hourStart) { bucket.hourStart = hourStart; bucket.hourCount = 0; }
  bucket.touchedAt = now;
  if (bucket.minuteCount >= MINUTE_LIMIT || bucket.hourCount >= HOUR_LIMIT) {
    const retryAfter = bucket.minuteCount >= MINUTE_LIMIT
      ? Math.max(1, Math.ceil((minuteStart + 60_000 - now) / 1000))
      : Math.max(1, Math.ceil((hourStart + 3_600_000 - now) / 1000));
    return { ok: false as const, retryAfter, source: "memory" as const };
  }
  bucket.minuteCount += 1;
  bucket.hourCount += 1;
  buckets.set(key, bucket);
  return { ok: true as const, remainingMinute: MINUTE_LIMIT - bucket.minuteCount, remainingHour: HOUR_LIMIT - bucket.hourCount, source: "memory" as const };
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

async function consumeDistributedRateLimit(key: string) {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) return null;
  const now = Date.now();
  const minuteStart = nowBucket(now, 60_000);
  const hourStart = nowBucket(now, 3_600_000);
  const minuteKey = `usagi:rl:m:${minuteStart}:${key}`;
  const hourKey = `usagi:rl:h:${hourStart}:${key}`;
  const minute = await upstashCommand(["INCR", minuteKey]);
  const hour = await upstashCommand(["INCR", hourKey]);
  const minuteCount = Number(minute?.result ?? 0);
  const hourCount = Number(hour?.result ?? 0);
  if (minuteCount === 1) await upstashCommand(["EXPIRE", minuteKey, 70]);
  if (hourCount === 1) await upstashCommand(["EXPIRE", hourKey, 3700]);
  if (minuteCount > MINUTE_LIMIT || hourCount > HOUR_LIMIT) {
    const retryAfter = minuteCount > MINUTE_LIMIT
      ? Math.max(1, Math.ceil((minuteStart + 60_000 - now) / 1000))
      : Math.max(1, Math.ceil((hourStart + 3_600_000 - now) / 1000));
    return { ok: false as const, retryAfter, source: "upstash" as const };
  }
  return { ok: true as const, remainingMinute: Math.max(0, MINUTE_LIMIT - minuteCount), remainingHour: Math.max(0, HOUR_LIMIT - hourCount), source: "upstash" as const };
}

export async function consumeRateLimit(key: string) {
  try {
    const distributed = await consumeDistributedRateLimit(key);
    if (distributed) return distributed;
  } catch (error) {
    console.error("[usagi/rate-limit] distributed store failed; using memory fallback", error);
  }
  return consumeMemoryRateLimit(key);
}

type Bucket = { minuteStart: number; minuteCount: number; hourStart: number; hourCount: number };
const buckets = new Map<string, Bucket>();
const MINUTE_LIMIT = 3;
const HOUR_LIMIT = 20;

function nowBucket(now: number, sizeMs: number) { return Math.floor(now / sizeMs) * sizeMs; }

export function getClientKey(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = request.headers.get("x-real-ip")?.trim();
  return forwarded || realIp || "unknown";
}

export function consumeRateLimit(key: string) {
  const now = Date.now();
  const minuteStart = nowBucket(now, 60_000);
  const hourStart = nowBucket(now, 3_600_000);
  const bucket = buckets.get(key) ?? { minuteStart, minuteCount: 0, hourStart, hourCount: 0 };
  if (bucket.minuteStart !== minuteStart) { bucket.minuteStart = minuteStart; bucket.minuteCount = 0; }
  if (bucket.hourStart !== hourStart) { bucket.hourStart = hourStart; bucket.hourCount = 0; }
  if (bucket.minuteCount >= MINUTE_LIMIT || bucket.hourCount >= HOUR_LIMIT) {
    const retryAfter = bucket.minuteCount >= MINUTE_LIMIT ? Math.max(1, Math.ceil((minuteStart + 60_000 - now) / 1000)) : Math.max(1, Math.ceil((hourStart + 3_600_000 - now) / 1000));
    return { ok: false as const, retryAfter };
  }
  bucket.minuteCount += 1;
  bucket.hourCount += 1;
  buckets.set(key, bucket);
  return { ok: true as const, remainingMinute: MINUTE_LIMIT - bucket.minuteCount, remainingHour: HOUR_LIMIT - bucket.hourCount };
}

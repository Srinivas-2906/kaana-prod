type Bucket = {
  timestamps: number[];
  lastRequestAt: number;
};

const ipBuckets = new Map<string, Bucket>();
let globalDayKey = "";
let globalDayCount = 0;

function dayKey(now = Date.now()) {
  return new Date(now).toISOString().slice(0, 10);
}

function pruneOld(timestamps: number[], windowMs: number, now: number) {
  return timestamps.filter((t) => now - t < windowMs);
}

function getLimits() {
  const isDev = process.env.NODE_ENV === "development";
  return {
    ipWindowMs: 15 * 60 * 1000,
    ipMaxPerWindow: Number(
      process.env.GEMINI_IP_WINDOW_LIMIT ?? (isDev ? 12 : 3),
    ),
    ipMaxPerDay: Number(process.env.GEMINI_IP_DAILY_LIMIT ?? (isDev ? 30 : 8)),
    minIntervalMs: Number(
      process.env.GEMINI_IP_MIN_INTERVAL_MS ?? (isDev ? 2000 : 10_000),
    ),
    globalDailyMax: Number(process.env.GEMINI_DAILY_LIMIT ?? (isDev ? 100 : 50)),
  };
}

export type RateLimitResult =
  | { ok: true }
  | { ok: false; status: number; error: string; retryAfterSec?: number };

export function checkAiRateLimit(clientKey: string): RateLimitResult {
  const now = Date.now();
  const limits = getLimits();
  const today = dayKey(now);

  if (globalDayKey !== today) {
    globalDayKey = today;
    globalDayCount = 0;
  }

  if (globalDayCount >= limits.globalDailyMax) {
    return {
      ok: false,
      status: 503,
      error: "AI demo daily limit reached. Please try again tomorrow or contact us directly.",
    };
  }

  const bucket = ipBuckets.get(clientKey) ?? {
    timestamps: [],
    lastRequestAt: 0,
  };

  bucket.timestamps = pruneOld(bucket.timestamps, limits.ipWindowMs, now);
  const dayTimestamps = pruneOld(bucket.timestamps, 24 * 60 * 60 * 1000, now);

  if (now - bucket.lastRequestAt < limits.minIntervalMs) {
    const retryAfterSec = Math.ceil(
      (limits.minIntervalMs - (now - bucket.lastRequestAt)) / 1000,
    );
    return {
      ok: false,
      status: 429,
      error: "Please wait a few seconds before generating again.",
      retryAfterSec,
    };
  }

  if (bucket.timestamps.length >= limits.ipMaxPerWindow) {
    return {
      ok: false,
      status: 429,
      error: "Too many requests. Please wait about 15 minutes and try again.",
      retryAfterSec: 900,
    };
  }

  if (dayTimestamps.length >= limits.ipMaxPerDay) {
    return {
      ok: false,
      status: 429,
      error: "Daily demo limit reached for your connection. Contact us for a full consultation.",
    };
  }

  bucket.timestamps.push(now);
  bucket.lastRequestAt = now;
  ipBuckets.set(clientKey, bucket);
  globalDayCount += 1;

  if (ipBuckets.size > 5000) {
    ipBuckets.clear();
  }

  return { ok: true };
}

export function getClientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }
  return request.headers.get("x-real-ip") ?? "unknown";
}

export function isAllowedAiOrigin(request: Request): boolean {
  const allowedHosts = [
    "kaana.in",
    "www.kaana.in",
    "localhost",
    "127.0.0.1",
  ];

  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");

  for (const value of [origin, referer]) {
    if (!value) continue;
    try {
      const host = new URL(value).hostname;
      if (allowedHosts.includes(host)) return true;
    } catch {
      /* ignore malformed */
    }
  }

  return process.env.NODE_ENV !== "production";
}

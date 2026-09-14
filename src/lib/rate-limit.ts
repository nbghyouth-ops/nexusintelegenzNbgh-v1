// Best-effort in-memory rate limiter. Because serverless deployments
// (e.g. Vercel) run multiple ephemeral instances, this does not provide a
// hard guarantee across all requests — it protects a single warm instance
// from rapid abuse. For strict multi-instance rate limiting, back this with
// a shared store (e.g. Redis) in production.
const buckets = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (bucket.count >= limit) return false;
  bucket.count += 1;
  return true;
}

// Periodically clear stale buckets to avoid unbounded memory growth.
setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt < now) buckets.delete(key);
  }
}, 60_000).unref?.();

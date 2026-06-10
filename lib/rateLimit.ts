/**
 * lib/rateLimit.ts
 *
 * In-process rate limiter using a plain Map — no external dependencies.
 * Limits each IP to MAX_REQUESTS within WINDOW_MS milliseconds.
 *
 * Caveat: state resets on every server restart / cold start.
 * For multi-instance / edge deployments, replace with Upstash Redis or
 * a Supabase-backed counter.
 */

const MAX_REQUESTS = 5;           // max attempts per window
const WINDOW_MS    = 60 * 1000;   // 60 seconds

interface RateLimitEntry {
  count:   number;
  resetAt: number; // epoch ms
}

// Module-level store — persists across requests within the same process
const store = new Map<string, RateLimitEntry>();

/** Periodically evict expired entries to avoid memory growth */
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000; // every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
      if (now >= entry.resetAt) store.delete(key);
    }
  }, CLEANUP_INTERVAL_MS);
}

export interface RateLimitResult {
  allowed:            boolean;
  remaining:          number; // requests left in current window
  retryAfterSeconds:  number; // 0 when allowed
}

/**
 * Check and record one request for the given identifier (typically an IP).
 * Call this at the very start of your route handler.
 */
export function checkRateLimit(identifier: string): RateLimitResult {
  const now = Date.now();
  let entry = store.get(identifier);

  // Window expired — start fresh
  if (!entry || now >= entry.resetAt) {
    entry = { count: 0, resetAt: now + WINDOW_MS };
  }

  if (entry.count >= MAX_REQUESTS) {
    // Still within the blocked window
    const retryAfterSeconds = Math.ceil((entry.resetAt - now) / 1000);
    store.set(identifier, entry);
    return { allowed: false, remaining: 0, retryAfterSeconds };
  }

  entry.count += 1;
  store.set(identifier, entry);

  return {
    allowed:           true,
    remaining:         MAX_REQUESTS - entry.count,
    retryAfterSeconds: 0,
  };
}

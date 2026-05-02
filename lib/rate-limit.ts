/**
 * Rate Limiting Utility
 * Uses in-memory store for development, Redis for production
 */

interface RateLimitOptions {
  interval: number; // milliseconds
  uniqueTokenPerInterval: number;
}

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

class RateLimiter {
  private store: Map<string, { count: number; resetAt: number }> = new Map();
  private interval: number;
  private uniqueTokenPerInterval: number;

  constructor(options: RateLimitOptions) {
    this.interval = options.interval;
    this.uniqueTokenPerInterval = options.uniqueTokenPerInterval;

    // Cleanup expired entries every minute
    setInterval(() => {
      const now = Date.now();
      for (const [key, value] of this.store.entries()) {
        if (value.resetAt < now) {
          this.store.delete(key);
        }
      }
    }, 60 * 1000);
  }

  async check(key: string, limit: number): Promise<RateLimitResult> {
    const now = Date.now();
    const entry = this.store.get(key);

    if (!entry || entry.resetAt < now) {
      // Create new entry
      const resetAt = now + this.interval;
      this.store.set(key, { count: 1, resetAt });

      return {
        success: true,
        limit,
        remaining: limit - 1,
        reset: resetAt,
      };
    }

    // Increment count
    entry.count++;

    const remaining = Math.max(0, limit - entry.count);
    const success = entry.count <= limit;

    return {
      success,
      limit,
      remaining,
      reset: entry.resetAt,
    };
  }

  reset(key: string): void {
    this.store.delete(key);
  }
}

export function createLimiter(options: RateLimitOptions): RateLimiter {
  return new RateLimiter(options);
}

export default {
  createLimiter,
};

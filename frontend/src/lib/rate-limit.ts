// In-memory rate limiting for demonstration/mock purposes.
// Replace with @upstash/ratelimit for production.

const rateLimits = new Map<string, { count: number; resetAt: number }>();

export const rateLimit = async (identifier: string) => {
  const limit = 10; // 10 requests
  const windowMs = 60 * 1000; // 1 minute
  const now = Date.now();

  const record = rateLimits.get(identifier);

  if (!record) {
    rateLimits.set(identifier, { count: 1, resetAt: now + windowMs });
    return { success: true };
  }

  if (now > record.resetAt) {
    rateLimits.set(identifier, { count: 1, resetAt: now + windowMs });
    return { success: true };
  }

  if (record.count >= limit) {
    return { success: false };
  }

  record.count += 1;
  return { success: true };
};

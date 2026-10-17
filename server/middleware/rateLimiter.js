/**
 * In-memory sliding window rate limiter middleware for authentication endpoints
 * Protects against brute-force attacks and credential stuffing
 */

class RateLimiter {
  constructor(windowMs = 15 * 60 * 1000, maxAttempts = 50, message = 'Too many requests. Please try again later.') {
    this.windowMs = windowMs;
    this.maxAttempts = maxAttempts;
    this.message = message;
    this.hits = new Map();

    // Clean up expired entries every 5 minutes to prevent memory leaks
    setInterval(() => {
      const now = Date.now();
      for (const [key, record] of this.hits.entries()) {
        if (now > record.resetTime) {
          this.hits.delete(key);
        }
      }
    }, 5 * 60 * 1000).unref();
  }

  middleware() {
    return (req, res, next) => {
      // Key on client IP address
      const rawIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
      const ip = Array.isArray(rawIp) ? rawIp[0] : rawIp.split(',')[0].trim();

      // Don't throttle localhost loopback in development to avoid locking out the developer
      const isLocalhost =
        ip === '127.0.0.1' ||
        ip === '::1' ||
        ip === '::ffff:127.0.0.1' ||
        ip === 'localhost';

      if (isLocalhost && process.env.NODE_ENV !== 'production') {
        return next();
      }

      const key = `${ip}:${req.baseUrl || ''}${req.path}`;
      const now = Date.now();

      let record = this.hits.get(key);

      if (!record || now > record.resetTime) {
        record = {
          count: 1,
          resetTime: now + this.windowMs,
        };
        this.hits.set(key, record);
      } else {
        record.count += 1;
      }

      const remaining = Math.max(0, this.maxAttempts - record.count);
      const resetSeconds = Math.ceil((record.resetTime - now) / 1000);

      res.setHeader('X-RateLimit-Limit', this.maxAttempts);
      res.setHeader('X-RateLimit-Remaining', remaining);
      res.setHeader('X-RateLimit-Reset', resetSeconds);

      if (record.count > this.maxAttempts) {
        res.setHeader('Retry-After', resetSeconds);
        return res.status(429).json({
          success: false,
          isRateLimited: true,
          message: `${this.message} (Retry in ${resetSeconds}s)`,
          retryAfter: resetSeconds,
        });
      }

      next();
    };
  }
}

// 50 login requests per 15 minutes per IP (bypassed on localhost in dev)
export const loginRateLimiter = new RateLimiter(
  15 * 60 * 1000,
  50,
  'Too many login attempts from this IP address. Please try again in 15 minutes.'
).middleware();

// 30 registration requests per hour per IP (bypassed on localhost in dev)
export const registerRateLimiter = new RateLimiter(
  60 * 60 * 1000,
  30,
  'Too many registration attempts from this IP. Please try again later.'
).middleware();

// 20 password reset requests per 15 minutes per IP
export const passwordResetRateLimiter = new RateLimiter(
  15 * 60 * 1000,
  20,
  'Too many password reset requests. Please wait a few minutes before trying again.'
).middleware();

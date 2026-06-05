import rateLimit from 'express-rate-limit';

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // generous for conference - many devices per person
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many login attempts. Please try again later.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
});

export const generalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 300, // high limit for conference with many concurrent users
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests. Please wait a moment.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const scanLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 15,
  // Key by user ID (from JWT) so shared conference WiFi doesn't block everyone
  keyGenerator: (req: any) => req.user?.userId || 'anonymous',
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many scan attempts. Please wait a moment.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
});

import rateLimit from "express-rate-limit";
import env from "../config/env.js";

export const makeLimiter = (max, message) =>
  rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    limit: max,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    handler: (_req, res) => res.status(429).json({ success: false, message }),
  });

/** Global API limiter — applied to every request. */
export const apiLimiter = makeLimiter(
  env.RATE_LIMIT_MAX,
  "Too many requests, please slow down and try again.",
);

/** Strict limiter for /auth endpoints (login throttling). */
export const authLimiter = makeLimiter(
  env.AUTH_RATE_LIMIT_MAX,
  "Too many authentication attempts. Please wait before trying again.",
);

/** Limiter for public enquiry endpoints (spam protection). */
export const publicLimiter = makeLimiter(
  env.PUBLIC_RATE_LIMIT_MAX,
  "Too many submissions. Please wait a moment before trying again.",
);

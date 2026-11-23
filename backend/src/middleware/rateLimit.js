import rateLimit from "express-rate-limit";
import env from "../config/env.js";

// express-rate-limit starts a reset timer at construction — illegal in
// Workers' global scope. Build each limiter lazily on first request.
const isWorkers =
  typeof navigator !== "undefined" && navigator.userAgent === "Cloudflare-Workers";

const lazy = (max, message) => {
  let inner;
  return (req, res, next) =>
    (inner ??= rateLimit({
      windowMs: env.RATE_LIMIT_WINDOW_MS,
      limit: max,
      standardHeaders: "draft-7",
      legacyHeaders: false,
      handler: (_req, r) => r.status(429).json({ success: false, message }),
      // workerd sockets have no remoteAddress → req.ip is undefined.
      // Key on CF-Connecting-IP and silence the init-time validations.
      ...(isWorkers && {
        keyGenerator: (r) => r.headers["cf-connecting-ip"] ?? r.ip ?? "unknown",
        validate: false,
      }),
    }))(req, res, next);
};

/** Create a limiter with a custom cap — defers construction to first request. */
export const makeLimiter = lazy;

/** Global API limiter — applied to every request. */
export const apiLimiter = lazy(
  env.RATE_LIMIT_MAX,
  "Too many requests, please slow down and try again.",
);

/** Strict limiter for /auth endpoints (login throttling). */
export const authLimiter = lazy(
  env.AUTH_RATE_LIMIT_MAX,
  "Too many authentication attempts. Please wait before trying again.",
);

/** Limiter for public enquiry endpoints (spam protection). */
export const publicLimiter = lazy(
  env.PUBLIC_RATE_LIMIT_MAX,
  "Too many submissions. Please wait a moment before trying again.",
);

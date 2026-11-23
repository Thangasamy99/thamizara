import env from "../config/env.js";
import ApiError from "../utils/ApiError.js";
import logger from "../utils/logger.js";

export function notFound(req, res) {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.path}` });
}

export function errorHandler(err, req, res, _next) {
  const status = err instanceof ApiError ? err.status : 500;
  const expose = err instanceof ApiError && err.expose;

  if (status >= 500) {
    req.log?.error({ err }, "Unhandled error");
    logger.error({ err, path: req.path }, "Unhandled error");
  } else {
    req.log?.warn({ err: err.message, path: req.path }, "Request error");
  }

  res.status(status).json({
    success: false,
    message: expose ? err.message : "An unexpected error occurred. Please try again later.",
    ...(err.errors ? { errors: err.errors } : {}),
    // Stack traces only outside production.
    ...(!env.isProd && status >= 500 ? { stack: err.stack } : {}),
  });
}

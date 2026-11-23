import pino from "pino";
import env from "../config/env.js";

const logger = pino({
  name: "thamizora-api",
  level: env.LOG_LEVEL,
  // Never log these even if accidentally attached to a request/response object.
  redact: {
    paths: [
      "req.headers.authorization",
      "req.headers.cookie",
      "res.headers['set-cookie']",
      "*.password",
      "*.passwordHash",
      "*.token",
      "*.refreshToken",
    ],
    censor: "[redacted]",
  },
});

export default logger;

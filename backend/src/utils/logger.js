import pino from "pino";
import env from "../config/env.js";

const isWorkers =
  typeof navigator !== "undefined" && navigator.userAgent === "Cloudflare-Workers";

const logger = pino({
  name: "thamizara-api",
  level: env.LOG_LEVEL,
  // Workers has no stdout streams — emit JSON lines via console instead.
  ...(isWorkers ? { browser: { write: (o) => console.log(JSON.stringify(o)) } } : {}),
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

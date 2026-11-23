import app from "./app.js";
import env from "./config/env.js";
import logger from "./utils/logger.js";
import { closePool, getPool } from "./database/pool.js";
import { startNotificationWorker } from "./services/notifications.js";

const server = app.listen(env.PORT, async () => {
  logger.info(
    { port: env.PORT, env: env.NODE_ENV, cors: env.CORS_ORIGINS },
    `${env.APP_NAME} listening`,
  );
  // Verify DB connectivity at startup (non-fatal — /health reports status).
  try {
    await getPool().query("SELECT 1");
    logger.info({ db: env.DB_NAME, host: env.DB_HOST }, "Database connected");
  } catch (err) {
    logger.warn({ err: err.message }, "Database unreachable at startup — /health will report db: down");
  }
  // Retry pending email notifications every minute.
  if (!env.isTest) startNotificationWorker(60_000);
});

const shutdown = (signal) => {
  logger.info({ signal }, "Shutting down gracefully");
  server.close(async () => {
    await closePool().catch(() => {});
    logger.info("HTTP server closed, DB pool released");
    process.exit(0);
  });
  // Force exit if connections linger.
  setTimeout(() => process.exit(1), 10_000).unref();
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("unhandledRejection", (err) => logger.error({ err }, "Unhandled rejection"));

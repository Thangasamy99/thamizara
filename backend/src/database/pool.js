import mysql from "mysql2/promise";
import env from "../config/env.js";
import logger from "../utils/logger.js";

let pool;

/** Lazily creates and returns the shared MySQL connection pool. */
export function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: env.DB_HOST,
      port: env.DB_PORT,
      user: env.DB_USER,
      password: env.DB_PASSWORD,
      database: env.DB_NAME,
      connectionLimit: env.DB_CONNECTION_LIMIT,
      charset: "utf8mb4",
      namedPlaceholders: false,
      supportBigNumbers: true,
      bigNumberStrings: true,
      dateStrings: true,
      waitForConnections: true,
      queueLimit: 0,
    });
  }
  return pool;
}

/**
 * Runs a function inside a transaction on a dedicated connection.
 * Commits on success, rolls back on any thrown error.
 */
export async function withTransaction(fn) {
  const conn = await getPool().getConnection();
  try {
    await conn.beginTransaction();
    const result = await fn(conn);
    await conn.commit();
    return result;
  } catch (err) {
    await conn.rollback().catch(() => {});
    throw err;
  } finally {
    conn.release();
  }
}

/** Liveness probe used by the health endpoint. Never throws. */
export async function checkDb() {
  try {
    await getPool().query("SELECT 1");
    return "up";
  } catch (err) {
    logger.warn({ err: err.message }, "Database health check failed");
    return "down";
  }
}

export async function closePool() {
  if (pool) {
    await pool.end();
    pool = undefined;
  }
}

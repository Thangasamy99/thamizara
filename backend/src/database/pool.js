import { AsyncLocalStorage } from "node:async_hooks";
import mysql from "mysql2/promise";
import env from "../config/env.js";
import logger from "../utils/logger.js";

let pool;

const isWorkers =
  typeof navigator !== "undefined" && navigator.userAgent === "Cloudflare-Workers";

// On Workers, sockets live in per-request I/O contexts — a shared pool
// would hand a dead connection to the next request. Each request gets
// its own small pool, closed when the response finishes.
export const dbContext = isWorkers ? new AsyncLocalStorage() : null;

function createPool() {
  // On Workers, a Hyperdrive binding (HYPERDRIVE on process.env) takes
  // precedence — it proxies to the origin MySQL/TiDB over a pooled socket.
  const hyper = process.env.HYPERDRIVE;
  const hyperdrive =
    hyper && typeof hyper === "object" && hyper.host ? hyper : null;
  return mysql.createPool({
    host: hyperdrive?.host ?? env.DB_HOST,
    port: hyperdrive?.port ?? env.DB_PORT,
    user: hyperdrive?.user ?? env.DB_USER,
    password: hyperdrive?.password ?? env.DB_PASSWORD,
    database: hyperdrive?.database ?? env.DB_NAME,
    // Workers forbids eval(); required for mysql2 in that runtime.
    disableEval: isWorkers ? true : undefined,
    // Direct TLS (TiDB Cloud and most managed MySQL require it).
    // Not needed through Hyperdrive — it terminates TLS at the origin.
    ssl: !hyperdrive && env.DB_SSL ? { minVersion: "TLSv1.2" } : undefined,
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

/** Lazily creates and returns the MySQL connection pool. */
export function getPool() {
  if (isWorkers) {
    const store = dbContext.getStore();
    if (!store) throw new Error("Database accessed outside a request context");
    return (store.pool ??= createPool());
  }
  return (pool ??= createPool());
}

/** Closes the current request's pool — Workers only. */
export function closeRequestPool() {
  const p = dbContext?.getStore()?.pool;
  if (p) p.end().catch(() => {});
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

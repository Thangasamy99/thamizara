import { execSync } from "node:child_process";
import path from "node:path";

// Test environment — set BEFORE any app imports.
process.env.NODE_ENV = "test";
process.env.DB_NAME = "thamizora_test";
process.env.LOG_LEVEL = "fatal";
process.env.AUTH_RATE_LIMIT_MAX = "10000";
process.env.RATE_LIMIT_MAX = "10000";
process.env.PUBLIC_RATE_LIMIT_MAX = "10000";
process.env.NOTIFICATION_AUTODELIVER = "false";

export const BACKEND_DIR = path.resolve(
  path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1")),
  "..",
);

const { getPool, closePool } = await import("../src/database/pool.js");
const { seedRbac } = await import("../src/database/seedRbac.js");
const { hashPassword } = await import("../src/utils/passwords.js");

const TABLES = [
  "activity_logs", "notification_attempts", "notifications", "idempotency_keys",
  "lead_notes", "lead_assignments", "customer_notes",
  "quotation_revisions", "quotation_items", "quotations", "leads", "customers",
  "password_reset_tokens", "refresh_tokens",
  "user_roles", "role_permissions", "permissions", "roles", "users",
];

/** Applies migrations to thamizora_test and resets all data. */
export async function resetTestDb() {
  execSync("node src/database/migrate.js up", {
    cwd: BACKEND_DIR,
    env: { ...process.env },
    stdio: "pipe",
  });
  const pool = getPool();
  await pool.query("SET FOREIGN_KEY_CHECKS = 0");
  for (const t of TABLES) await pool.query(`TRUNCATE TABLE ${t}`);
  await pool.query("SET FOREIGN_KEY_CHECKS = 1");
  await pool.query("DELETE FROM counters");
  await seedRbac(pool);
}

export async function makeUser({ email, password = "Passw0rd!A", roles = ["STAFF"], status = "ACTIVE", name = "Test User" }) {
  const pool = getPool();
  const hash = await hashPassword(password);
  const [r] = await pool.query(
    "INSERT INTO users (name, email, password_hash, status) VALUES (?, ?, ?, ?)",
    [name, email, hash, status],
  );
  for (const role of roles) {
    const [[roleRow]] = await pool.query("SELECT id FROM roles WHERE name = ?", [role]);
    await pool.query("INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)", [r.insertId, roleRow.id]);
  }
  return { id: r.insertId, email, password };
}

export async function startServer() {
  const { default: app } = await import("../src/app.js");
  return new Promise((resolve) => {
    const server = app.listen(0, () => {
      resolve({ server, base: `http://127.0.0.1:${server.address().port}` });
    });
  });
}

export async function stopServer(server) {
  server.close();
  await closePool();
}

/** POST /auth/login → { accessToken, refreshCookie } */
export async function login(base, email, password) {
  const res = await fetch(`${base}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const body = await res.json();
  const setCookie = res.headers.get("set-cookie") ?? "";
  return { res, body, accessToken: body.data?.accessToken, cookie: setCookie.split(";")[0] };
}

export const auth = (token) => ({ Authorization: `Bearer ${token}`, "Content-Type": "application/json" });
export const get = (base, path, token) => fetch(`${base}/api/v1${path}`, { headers: auth(token) });
export const post = (base, path, body, token, extraHeaders = {}) =>
  fetch(`${base}/api/v1${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...extraHeaders },
    body: JSON.stringify(body),
  });
export const postRaw = (base, path, extraHeaders = {}) =>
  fetch(`${base}/api/v1${path}`, { method: "POST", headers: extraHeaders });

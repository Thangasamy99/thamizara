import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import jwt from "jsonwebtoken";
import { execSync } from "node:child_process";
import {
  resetTestDb, makeUser, startServer, stopServer, login, auth, get, post, postRaw, BACKEND_DIR,
} from "./helpers.js";

const env = (await import("../src/config/env.js")).default;
const { getPool } = await import("../src/database/pool.js");

let server, base;

before(async () => {
  await resetTestDb();
  ({ server, base } = await startServer());
});
after(async () => stopServer(server));

const SA = { email: "super@test.dev", password: "Sup3rPass!", roles: ["SUPER_ADMIN"] };

let saToken;
const saLogin = async () => {
  const r = await login(base, SA.email, SA.password);
  saToken = r.accessToken;
  return r;
};

test("seed:admin creates the first SUPER_ADMIN and refuses duplicates", async () => {
  execSync(
    `node seeds/seed.js --name "Super" --email ${SA.email} --password "${SA.password}"`,
    { cwd: BACKEND_DIR, env: { ...process.env }, stdio: "pipe" },
  );
  // Duplicate run must fail.
  assert.throws(() =>
    execSync(
      `node seeds/seed.js --name "X" --email other@test.dev --password "Passw0rd!B"`,
      { cwd: BACKEND_DIR, env: { ...process.env }, stdio: "pipe" },
    ),
  );
  const [rows] = await getPool().query(
    `SELECT u.id FROM users u JOIN user_roles ur ON ur.user_id=u.id JOIN roles r ON r.id=ur.role_id
      WHERE u.email=? AND r.name='SUPER_ADMIN'`, [SA.email],
  );
  assert.equal(rows.length, 1);
});

/* ── Login ────────────────────────────────────────────────── */

test("successful login returns user + access token and sets httpOnly cookie", async () => {
  const { res, body, cookie } = await saLogin();
  assert.equal(res.status, 200);
  assert.ok(body.data.accessToken.length > 20);
  assert.equal(body.data.user.email, SA.email);
  assert.ok(cookie.startsWith("tmz_rt="));
});

test("invalid email or password is rejected with a generic 401", async () => {
  const r1 = await post(base, "/auth/login", { email: "nobody@test.dev", password: "x" });
  const r2 = await post(base, "/auth/login", { email: SA.email, password: "wrong" });
  assert.equal(r1.status, 401);
  assert.equal(r2.status, 401);
  const b = await r2.json();
  assert.match(b.message, /invalid email or password/i);
});

test("inactive user cannot log in", async () => {
  const u = await makeUser({ email: "inactive@test.dev", status: "INACTIVE" });
  const r = await post(base, "/auth/login", { email: u.email, password: u.password });
  assert.equal(r.status, 403);
});

test("account locks after repeated failed attempts", async () => {
  const u = await makeUser({ email: "lockme@test.dev" });
  for (let i = 0; i < 5; i++) await post(base, "/auth/login", { email: u.email, password: "nope" });
  const r = await post(base, "/auth/login", { email: u.email, password: u.password });
  assert.equal(r.status, 429);
});

/* ── JWT ──────────────────────────────────────────────────── */

test("expired access token is rejected", async () => {
  const stale = jwt.sign({ sub: "1" }, env.JWT_ACCESS_SECRET, {
    expiresIn: "-1s", issuer: env.JWT_ISSUER, audience: env.JWT_AUDIENCE,
  });
  const r = await get(base, "/auth/me", stale);
  assert.equal(r.status, 401);
});

test("forged/malformed tokens are rejected", async () => {
  const r1 = await get(base, "/auth/me", "not-a-token");
  const bad = jwt.sign({ sub: "1" }, "wrong-secret", {
    issuer: env.JWT_ISSUER, audience: env.JWT_AUDIENCE,
  });
  const r2 = await get(base, "/auth/me", bad);
  assert.equal(r1.status, 401);
  assert.equal(r2.status, 401);
});

test("GET /auth/me returns the current identity", async () => {
  await saLogin();
  const r = await get(base, "/auth/me", saToken);
  const b = await r.json();
  assert.equal(r.status, 200);
  assert.equal(b.data.user.email, SA.email);
  assert.ok(b.data.user.roles.includes("SUPER_ADMIN"));
  assert.ok(b.data.user.permissions.includes("users.create"));
});

test("request without a token is rejected", async () => {
  const r = await fetch(`${base}/api/v1/auth/me`);
  assert.equal(r.status, 401);
});

/* ── Refresh rotation + reuse ─────────────────────────────── */

test("refresh rotates the token and the old cookie stops working", async () => {
  const { cookie } = await saLogin();
  const r1 = await postRaw(base, "/auth/refresh", { Cookie: cookie });
  assert.equal(r1.status, 200);
  const newCookie = (r1.headers.get("set-cookie") ?? "").split(";")[0];
  assert.notEqual(newCookie, cookie);
  // Old (now rotated) cookie must be rejected → family revoked.
  const r2 = await postRaw(base, "/auth/refresh", { Cookie: cookie });
  assert.equal(r2.status, 401);
});

test("refresh-token reuse revokes the entire family", async () => {
  const { cookie } = await saLogin();
  const r1 = await postRaw(base, "/auth/refresh", { Cookie: cookie });
  const cookie2 = (r1.headers.get("set-cookie") ?? "").split(";")[0];
  // Replay the first (rotated) token — triggers reuse detection.
  await postRaw(base, "/auth/refresh", { Cookie: cookie });
  // Even the newest token in the family is now dead.
  const r3 = await postRaw(base, "/auth/refresh", { Cookie: cookie2 });
  assert.equal(r3.status, 401);
  const [log] = await getPool().query(
    "SELECT id FROM activity_logs WHERE action='auth.refresh.reuse_detected' ORDER BY id DESC LIMIT 1",
  );
  assert.ok(log.length >= 1);
});

/* ── Logout ───────────────────────────────────────────────── */

test("logout revokes the refresh token", async () => {
  const { cookie } = await saLogin();
  const r = await postRaw(base, "/auth/logout", { Cookie: cookie });
  assert.equal(r.status, 200);
  const r2 = await postRaw(base, "/auth/refresh", { Cookie: cookie });
  assert.equal(r2.status, 401);
});

test("logout-all revokes every session for the user", async () => {
  const s1 = await saLogin();
  const s2 = await saLogin();
  const r = await postRaw(base, "/auth/logout-all", { Cookie: s1.cookie, Authorization: `Bearer ${s1.accessToken}` });
  assert.equal(r.status, 200);
  assert.equal((await postRaw(base, "/auth/refresh", { Cookie: s2.cookie })).status, 401);
});

/* ── Password change / reset ──────────────────────────────── */

test("change-password rotates the password and kills sessions", async () => {
  const u = await makeUser({ email: "chpw@test.dev", roles: ["STAFF"] });
  const s = await login(base, u.email, u.password);
  const r = await fetch(`${base}/api/v1/auth/change-password`, {
    method: "PUT",
    headers: auth(s.accessToken),
    body: JSON.stringify({ currentPassword: u.password, newPassword: "NewPass123!" }),
  });
  assert.equal(r.status, 200);
  assert.equal((await login(base, u.email, u.password)).res.status, 401);
  assert.equal((await login(base, u.email, "NewPass123!")).res.status, 200);
});

test("forgot-password never reveals whether the account exists", async () => {
  const r1 = await post(base, "/auth/forgot-password", { email: SA.email });
  const r2 = await post(base, "/auth/forgot-password", { email: "ghost@test.dev" });
  const [b1, b2] = await Promise.all([r1.json(), r2.json()]);
  assert.equal(r1.status, 200);
  assert.equal(r2.status, 200);
  assert.equal(b1.message, b2.message);
});

test("reset-password with a stored token hash works once", async () => {
  const { sha256, randomToken } = await import("../src/utils/crypto.js");
  const u = await makeUser({ email: "reset@test.dev", roles: ["STAFF"] });
  const token = randomToken(32);
  await getPool().query(
    "INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 1 HOUR))",
    [u.id, sha256(token)],
  );
  const r = await post(base, "/auth/reset-password", { token, password: "ResetPass1!" });
  assert.equal(r.status, 200);
  // Single use.
  const r2 = await post(base, "/auth/reset-password", { token, password: "OtherPass1!" });
  assert.equal(r2.status, 400);
  assert.equal((await login(base, u.email, "ResetPass1!")).res.status, 200);
});

test("reset-password rejects unknown/expired tokens", async () => {
  const r = await post(base, "/auth/reset-password", { token: "x".repeat(40), password: "Whatever1!" });
  assert.equal(r.status, 400);
});

/* ── RBAC ─────────────────────────────────────────────────── */

test("STAFF is forbidden from user-management endpoints", async () => {
  const u = await makeUser({ email: "staff@test.dev", roles: ["STAFF"] });
  const s = await login(base, u.email, u.password);
  assert.equal((await get(base, "/users", s.accessToken)).status, 403);
  const r = await post(base, "/users", { name: "X Y", email: "x@y.z", roles: ["STAFF"] }, s.accessToken);
  assert.equal(r.status, 403);
});

test("ADMIN cannot assign the SUPER_ADMIN role (privilege escalation blocked)", async () => {
  const u = await makeUser({ email: "admin@test.dev", roles: ["ADMIN"] });
  const s = await login(base, u.email, u.password);
  const target = await makeUser({ email: "target@test.dev", roles: ["STAFF"] });
  const r = await fetch(`${base}/api/v1/users/${target.id}/roles`, {
    method: "PUT",
    headers: auth(s.accessToken),
    body: JSON.stringify({ roles: ["SUPER_ADMIN"] }),
  });
  assert.equal(r.status, 403);
});

test("the last active SUPER_ADMIN cannot be deactivated", async () => {
  await saLogin();
  const [sa] = await getPool().query("SELECT id FROM users WHERE email = ?", [SA.email]);
  // A second SUPER_ADMIN acting on the only other SA → blocked only when target is last SA.
  const second = await makeUser({ email: "sa2@test.dev", roles: ["SUPER_ADMIN"] });
  const s2 = await login(base, second.email, second.password);
  // Deactivate first SA → ok (second remains).
  const r1 = await fetch(`${base}/api/v1/users/${sa[0].id}/status`, {
    method: "PATCH", headers: auth(s2.accessToken), body: JSON.stringify({ status: "INACTIVE" }),
  });
  assert.equal(r1.status, 200);
  // Self-deactivation is blocked outright.
  const r2 = await fetch(`${base}/api/v1/users/${second.id}/status`, {
    method: "PATCH", headers: auth(s2.accessToken), body: JSON.stringify({ status: "INACTIVE" }),
  });
  assert.equal(r2.status, 400);
  // An ADMIN (has users.deactivate) trying to remove the LAST active SA → conflict.
  const admin = await makeUser({ email: "sa-admin@test.dev", roles: ["ADMIN"] });
  const sa3 = await login(base, admin.email, admin.password);
  const r3 = await fetch(`${base}/api/v1/users/${second.id}/status`, {
    method: "PATCH", headers: auth(sa3.accessToken), body: JSON.stringify({ status: "SUSPENDED" }),
  });
  assert.equal(r3.status, 409);
});

test("users list/create work for SUPER_ADMIN with envelope shape", async () => {
  const s2 = await login(base, "sa2@test.dev", "Passw0rd!A");
  const list = await get(base, "/users?page=1&limit=10", s2.accessToken);
  const lb = await list.json();
  assert.equal(list.status, 200);
  assert.ok(Array.isArray(lb.data));
  assert.ok(lb.meta.total >= 2);
  const create = await post(base, "/users", {
    name: "Sales One", email: "sales1@test.dev", password: "Sales123!", roles: ["SALES_MANAGER"],
  }, s2.accessToken);
  assert.equal(create.status, 201);
  const cb = await create.json();
  assert.ok(cb.data.user.roles.includes("SALES_MANAGER"));
});

test("roles and permissions catalogues are readable", async () => {
  const s2 = await login(base, "sa2@test.dev", "Passw0rd!A");
  const r = await get(base, "/roles", s2.accessToken);
  const rb = await r.json();
  assert.equal(r.status, 200);
  const saRole = rb.data.roles.find((x) => x.name === "SUPER_ADMIN");
  assert.ok(saRole.permissions.includes("settings.update"));
  const staff = rb.data.roles.find((x) => x.name === "STAFF");
  assert.ok(!staff.permissions.includes("users.create"));
});

test("audit trail records login and role changes", async () => {
  const [rows] = await getPool().query(
    "SELECT action, COUNT(*) c FROM activity_logs WHERE action IN ('auth.login.success','user.roles.changed','user.created') GROUP BY action",
  );
  const actions = Object.fromEntries(rows.map((r) => [r.action, Number(r.c)]));
  assert.ok(actions["auth.login.success"] >= 1);
});

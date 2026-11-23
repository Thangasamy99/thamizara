import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import { hashPassword, verifyPassword, needsRehash } from "../../utils/passwords.js";
import env from "../../config/env.js";
import { getPool, withTransaction } from "../../database/pool.js";
import ApiError from "../../utils/ApiError.js";
import { randomToken, sha256 } from "../../utils/crypto.js";
import { audit } from "../../utils/audit.js";
import { sendMail } from "../../services/mailer.js";

const MAX_ATTEMPTS = 5;
const BASE_LOCK_MINUTES = 15;
const REFRESH_COOKIE = "tmz_rt";

export const refreshCookieOptions = {
  httpOnly: true,
  secure: env.isProd, // HTTPS only in production
  sameSite: env.isProd ? "none" : "lax", // 'none' allows the separate admin origin
  path: "/api/v1/auth", // cookie is only sent to auth endpoints
  maxAge: env.JWT_REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000,
};

const publicUser = ({ id, name, email, phone, status, roles, permissions, last_login_at, profile_image_url }) => ({
  id, name, email, phone, status, roles, permissions, lastLoginAt: last_login_at, profileImageUrl: profile_image_url,
});

async function loadIdentity(userId) {
  const [rows] = await getPool().query(
    `SELECT u.id, u.name, u.email, u.phone, u.status, u.last_login_at, u.profile_image_url,
            COALESCE(GROUP_CONCAT(DISTINCT r.name), '') AS roles,
            COALESCE(GROUP_CONCAT(DISTINCT p.code), '') AS permissions
       FROM users u
       LEFT JOIN user_roles ur ON ur.user_id = u.id
       LEFT JOIN roles r ON r.id = ur.role_id
       LEFT JOIN role_permissions rp ON rp.role_id = r.id
       LEFT JOIN permissions p ON p.id = rp.permission_id
      WHERE u.id = ? AND u.deleted_at IS NULL
      GROUP BY u.id`,
    [userId],
  );
  if (!rows[0]) return null;
  const u = rows[0];
  return publicUser({
    ...u,
    roles: u.roles ? u.roles.split(",") : [],
    permissions: u.permissions ? u.permissions.split(",") : [],
  });
}

const signAccessToken = (user) =>
  jwt.sign({ sub: String(user.id), email: user.email, name: user.name }, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_TTL,
    issuer: env.JWT_ISSUER,
    audience: env.JWT_AUDIENCE,
  });

async function issueRefreshToken(userId, { ip, userAgent }, familyId = crypto.randomUUID(), conn = getPool()) {
  const token = randomToken(48);
  const expiresAt = new Date(Date.now() + env.JWT_REFRESH_TTL_DAYS * 86_400_000);
  await conn.query(
    `INSERT INTO refresh_tokens (user_id, family_id, token_hash, expires_at, ip, user_agent)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [userId, familyId, sha256(token), expiresAt, ip, userAgent?.slice(0, 255) ?? null],
  );
  return token;
}

export async function issueSession(user, ctx) {
  return {
    accessToken: signAccessToken(user),
    refreshToken: await issueRefreshToken(user.id, ctx),
  };
}

/* ── Login with progressive lockout ─────────────────────────── */

const lockMinutesFor = (attempts) =>
  Math.min(BASE_LOCK_MINUTES * 2 ** Math.max(0, attempts - MAX_ATTEMPTS), 24 * 60);

export async function login({ email, password }, ctx) {
  const pool = getPool();
  const [rows] = await pool.query(
    `SELECT id, email, password_hash, status, failed_login_attempts, locked_until
       FROM users WHERE email = ? AND deleted_at IS NULL`,
    [email],
  );
  const user = rows[0];
  const genericFail = ApiError.unauthorized("Invalid email or password");

  if (user?.locked_until && new Date(user.locked_until) > new Date()) {
    await audit({ actorId: user.id, action: "auth.login.locked", summary: "Login attempt on locked account", ip: ctx.ip });
    throw new ApiError(429, "Account temporarily locked due to failed attempts. Please try again later.");
  }

  const passwordOk = user && (await verifyPassword(password, user.password_hash));
  if (!passwordOk) {
    if (user) {
      const attempts = user.failed_login_attempts + 1;
      const lock = attempts >= MAX_ATTEMPTS
        ? new Date(Date.now() + lockMinutesFor(attempts) * 60_000)
        : null;
      await pool.query(
        "UPDATE users SET failed_login_attempts = ?, locked_until = ? WHERE id = ?",
        [attempts, lock, user.id],
      );
      await audit({ actorId: user.id, action: "auth.login.failed", summary: `Failed login (${attempts} attempts)`, ip: ctx.ip });
    } else {
      await audit({ action: "auth.login.failed", summary: "Failed login for unknown email", ip: ctx.ip });
    }
    throw genericFail;
  }

  if (user.status !== "ACTIVE") {
    await audit({ actorId: user.id, action: "auth.login.failed", summary: `Login blocked — status ${user.status}`, ip: ctx.ip });
    throw ApiError.forbidden("This account is not active. Contact an administrator.");
  }

  // Transparent migration: legacy bcrypt hash → PBKDF2 on successful login.
  const rehash = needsRehash(user.password_hash)
    ? await hashPassword(password)
    : null;
  await pool.query(
    "UPDATE users SET failed_login_attempts = 0, locked_until = NULL, last_login_at = NOW(), password_hash = COALESCE(?, password_hash) WHERE id = ?",
    [rehash, user.id],
  );
  await audit({ actorId: user.id, action: "auth.login.success", entityType: "user", entityId: user.id, ip: ctx.ip });

  const identity = await loadIdentity(user.id);
  const session = await issueSession(identity, ctx);
  return { user: identity, ...session };
}

/* ── Refresh with rotation + reuse detection ────────────────── */

export async function refresh(token, ctx) {
  const pool = getPool();
  if (!token) throw ApiError.unauthorized("Refresh token missing");

  const [rows] = await pool.query(
    "SELECT id, user_id, family_id, expires_at, revoked_at FROM refresh_tokens WHERE token_hash = ?",
    [sha256(token)],
  );
  const stored = rows[0];

  // Unknown token — nothing to act on.
  if (!stored) throw ApiError.unauthorized("Invalid refresh token");

  // Reuse of an already-rotated token: treat as compromise — kill the family.
  if (stored.revoked_at) {
    await pool.query("UPDATE refresh_tokens SET revoked_at = NOW() WHERE family_id = ?", [stored.family_id]);
    await audit({
      actorId: stored.user_id,
      action: "auth.refresh.reuse_detected",
      entityType: "user",
      entityId: stored.user_id,
      summary: "Rotated refresh token reused — token family revoked",
      ip: ctx.ip,
    });
    throw ApiError.unauthorized("Session expired. Please log in again.");
  }
  if (new Date(stored.expires_at) <= new Date()) throw ApiError.unauthorized("Session expired. Please log in again.");

  const [urows] = await pool.query(
    "SELECT id, status FROM users WHERE id = ? AND deleted_at IS NULL", [stored.user_id],
  );
  if (!urows[0] || urows[0].status !== "ACTIVE") throw ApiError.unauthorized("Account is not active");

  const identity = await loadIdentity(stored.user_id);
  const accessToken = signAccessToken(identity);
  const refreshToken = await withTransaction(async (conn) => {
    await conn.query("UPDATE refresh_tokens SET revoked_at = NOW() WHERE id = ?", [stored.id]);
    return issueRefreshToken(stored.user_id, ctx, stored.family_id, conn);
  });
  return { accessToken, refreshToken, user: identity };
}

/* ── Logout ─────────────────────────────────────────────────── */

export async function logout(token, ctx) {
  if (!token) return;
  const pool = getPool();
  const [rows] = await pool.query(
    "SELECT id, user_id FROM refresh_tokens WHERE token_hash = ? AND revoked_at IS NULL",
    [sha256(token)],
  );
  if (rows[0]) {
    await pool.query("UPDATE refresh_tokens SET revoked_at = NOW() WHERE id = ?", [rows[0].id]);
    await audit({ actorId: rows[0].user_id, action: "auth.logout", entityType: "user", entityId: rows[0].user_id, ip: ctx.ip });
  }
}

export async function logoutAll(userId, ctx) {
  await getPool().query(
    "UPDATE refresh_tokens SET revoked_at = NOW() WHERE user_id = ? AND revoked_at IS NULL",
    [userId],
  );
  await audit({ actorId: userId, action: "auth.logout_all", entityType: "user", entityId: userId, ip: ctx.ip });
}

/* ── Password change ────────────────────────────────────────── */

export async function changePassword(userId, { currentPassword, newPassword }, ctx) {
  const pool = getPool();
  const [rows] = await pool.query("SELECT password_hash FROM users WHERE id = ? AND deleted_at IS NULL", [userId]);
  if (!rows[0] || !(await verifyPassword(currentPassword, rows[0].password_hash))) {
    throw ApiError.badRequest("Current password is incorrect");
  }
  const hash = await hashPassword(newPassword);
  await withTransaction(async (conn) => {
    await conn.query("UPDATE users SET password_hash = ? WHERE id = ?", [hash, userId]);
    await conn.query("UPDATE refresh_tokens SET revoked_at = NOW() WHERE user_id = ? AND revoked_at IS NULL", [userId]);
  });
  await audit({ actorId: userId, action: "auth.password.changed", entityType: "user", entityId: userId, ip: ctx.ip });
}

/* ── Forgot / reset password ────────────────────────────────── */

export async function forgotPassword(email, ctx) {
  const pool = getPool();
  const [rows] = await pool.query(
    "SELECT id, name, status FROM users WHERE email = ? AND deleted_at IS NULL", [email],
  );
  // Always respond identically — never reveal whether the account exists.
  if (!rows[0] || rows[0].status !== "ACTIVE") return;

  const token = randomToken(32);
  const expiresAt = new Date(Date.now() + env.PASSWORD_RESET_TTL_MINUTES * 60_000);
  await pool.query(
    "INSERT INTO password_reset_tokens (user_id, token_hash, expires_at, ip) VALUES (?, ?, ?, ?)",
    [rows[0].id, sha256(token), expiresAt, ctx.ip],
  );
  const link = `${env.ADMIN_APP_URL}/reset-password?token=${token}`;
  await sendMail({
    to: email,
    subject: "Reset your THAMIZARA admin password",
    text: `Hello ${rows[0].name},\n\nUse this link to reset your password (valid ${env.PASSWORD_RESET_TTL_MINUTES} minutes):\n${link}\n\nIf you did not request this, ignore this email.`,
  });
  await audit({ actorId: rows[0].id, action: "auth.password.reset_requested", entityType: "user", entityId: rows[0].id, ip: ctx.ip });
}

export async function resetPassword({ token, password }, ctx) {
  const pool = getPool();
  const [rows] = await pool.query(
    `SELECT id, user_id, expires_at, used_at FROM password_reset_tokens WHERE token_hash = ?`,
    [sha256(token)],
  );
  const stored = rows[0];
  if (!stored || stored.used_at || new Date(stored.expires_at) <= new Date()) {
    throw ApiError.badRequest("Reset link is invalid or has expired");
  }
  const hash = await hashPassword(password);
  await withTransaction(async (conn) => {
    await conn.query("UPDATE users SET password_hash = ? WHERE id = ?", [hash, stored.user_id]);
    // Single-use + invalidate any other outstanding tokens & sessions.
    await conn.query("UPDATE password_reset_tokens SET used_at = NOW() WHERE user_id = ? AND used_at IS NULL", [stored.user_id]);
    await conn.query("UPDATE refresh_tokens SET revoked_at = NOW() WHERE user_id = ? AND revoked_at IS NULL", [stored.user_id]);
  });
  await audit({ actorId: stored.user_id, action: "auth.password.reset", entityType: "user", entityId: stored.user_id, ip: ctx.ip });
}

export { loadIdentity, REFRESH_COOKIE };

import bcrypt from "bcryptjs";
import env from "../../config/env.js";
import { getPool, withTransaction } from "../../database/pool.js";
import ApiError from "../../utils/ApiError.js";
import { randomToken } from "../../utils/crypto.js";

const userSelect = `
  SELECT u.id, u.name, u.email, u.phone, u.profile_image_url, u.status,
         u.last_login_at, u.created_at, u.updated_at,
         COALESCE(GROUP_CONCAT(DISTINCT r.name), '') AS roles
    FROM users u
    LEFT JOIN user_roles ur ON ur.user_id = u.id
    LEFT JOIN roles r ON r.id = ur.role_id`;

const shape = (u) => ({
  id: u.id,
  name: u.name,
  email: u.email,
  phone: u.phone,
  profileImageUrl: u.profile_image_url,
  status: u.status,
  roles: u.roles ? u.roles.split(",") : [],
  lastLoginAt: u.last_login_at,
  createdAt: u.created_at,
  updatedAt: u.updated_at,
});

export async function listUsers({ page, limit, search, status }) {
  const pool = getPool();
  const where = ["u.deleted_at IS NULL"];
  const params = [];
  if (status) { where.push("u.status = ?"); params.push(status); }
  if (search) {
    where.push("(u.name LIKE ? OR u.email LIKE ?)");
    params.push(`%${search}%`, `%${search}%`);
  }
  const clause = where.join(" AND ");
  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) AS total FROM users u WHERE ${clause}`, params,
  );
  const [rows] = await pool.query(
    `${userSelect} WHERE ${clause} GROUP BY u.id ORDER BY u.created_at DESC LIMIT ? OFFSET ?`,
    [...params, limit, (page - 1) * limit],
  );
  return { rows: rows.map(shape), total };
}

export async function getUser(id) {
  const [rows] = await getPool().query(
    `SELECT u.id, u.name, u.email, u.phone, u.profile_image_url, u.status,
            u.last_login_at, u.created_at, u.updated_at,
            COALESCE(GROUP_CONCAT(DISTINCT r.name), '') AS roles
       FROM users u
       LEFT JOIN user_roles ur ON ur.user_id = u.id
       LEFT JOIN roles r ON r.id = ur.role_id
      WHERE u.id = ? AND u.deleted_at IS NULL GROUP BY u.id`, [id],
  );
  if (!rows[0]) throw ApiError.notFound("User not found");
  return shape(rows[0]);
}

const roleIdsFor = async (conn, roleNames) => {
  const [rows] = await conn.query(
    `SELECT id, name FROM roles WHERE name IN (${roleNames.map(() => "?").join(",")})`,
    roleNames,
  );
  if (rows.length !== roleNames.length) throw ApiError.badRequest("Unknown role");
  return Object.fromEntries(rows.map((r) => [r.name, r.id]));
};

const assignRoles = async (conn, userId, roleNames) => {
  const ids = await roleIdsFor(conn, roleNames);
  await conn.query("DELETE FROM user_roles WHERE user_id = ?", [userId]);
  for (const name of roleNames) {
    await conn.query("INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)", [userId, ids[name]]);
  }
};

/** How many ACTIVE users still hold the SUPER_ADMIN role (optionally excluding one user). */
const activeSuperAdmins = async (conn, excludeUserId = null) => {
  const [rows] = await conn.query(
    `SELECT COUNT(*) AS n FROM users u
       JOIN user_roles ur ON ur.user_id = u.id
       JOIN roles r ON r.id = ur.role_id
      WHERE r.name = 'SUPER_ADMIN' AND u.status = 'ACTIVE' AND u.deleted_at IS NULL
        AND (u.id != ? OR ? IS NULL)`,
    [excludeUserId ?? -1, excludeUserId],
  );
  return rows[0].n;
};

export async function createUser(actor, data) {
  const pool = getPool();
  const [dupe] = await pool.query("SELECT id FROM users WHERE email = ?", [data.email]);
  if (dupe.length) throw ApiError.conflict("A user with that email already exists");
  if (data.roles.includes("SUPER_ADMIN") && !actor.roles.includes("SUPER_ADMIN")) {
    throw ApiError.forbidden("Only a SUPER_ADMIN can assign the SUPER_ADMIN role");
  }

  const password = data.password ?? randomToken(10);
  const hash = await bcrypt.hash(password, env.BCRYPT_ROUNDS);
  const id = await withTransaction(async (conn) => {
    const [r] = await conn.query(
      `INSERT INTO users (name, email, password_hash, phone, profile_image_url, status)
       VALUES (?, ?, ?, ?, ?, 'ACTIVE')`,
      [data.name, data.email, hash, data.phone ?? null, data.profileImageUrl ?? null],
    );
    await assignRoles(conn, r.insertId, data.roles);
    return r.insertId;
  });
  return { user: await getUser(id), temporaryPassword: data.password ? undefined : password };
}

export async function updateUser(id, data) {
  await getUser(id);
  const fields = [];
  const params = [];
  if (data.name !== undefined) { fields.push("name = ?"); params.push(data.name); }
  if (data.email !== undefined) { fields.push("email = ?"); params.push(data.email); }
  if (data.phone !== undefined) { fields.push("phone = ?"); params.push(data.phone); }
  if (data.profileImageUrl !== undefined) { fields.push("profile_image_url = ?"); params.push(data.profileImageUrl); }
  await getPool().query(`UPDATE users SET ${fields.join(", ")} WHERE id = ?`, [...params, id])
    .catch((e) => { if (e.code === "ER_DUP_ENTRY") throw ApiError.conflict("Email already in use"); throw e; });
  return getUser(id);
}

export async function setUserStatus(actor, id, status) {
  if (String(actor.id) === String(id)) throw ApiError.badRequest("You cannot change your own account status");
  const target = await getUser(id);
  if (status !== "ACTIVE" && target.roles.includes("SUPER_ADMIN")) {
    const pool = getPool();
    const n = await activeSuperAdmins(pool, null);
    if (n <= 1) throw ApiError.conflict("Cannot deactivate the last active SUPER_ADMIN");
  }
  await getPool().query("UPDATE users SET status = ? WHERE id = ?", [status, id]);
  if (status !== "ACTIVE") {
    // Revoke live sessions on deactivation/suspension.
    await getPool().query("UPDATE refresh_tokens SET revoked_at = NOW() WHERE user_id = ? AND revoked_at IS NULL", [id]);
  }
  return getUser(id);
}

export async function setUserRoles(actor, id, roleNames) {
  if (String(actor.id) === String(id)) throw ApiError.badRequest("You cannot change your own roles");
  const target = await getUser(id);
  const isSA = actor.roles.includes("SUPER_ADMIN");

  if (roleNames.includes("SUPER_ADMIN") && !isSA) {
    throw ApiError.forbidden("Only a SUPER_ADMIN can assign the SUPER_ADMIN role");
  }
  const removingSA = target.roles.includes("SUPER_ADMIN") && !roleNames.includes("SUPER_ADMIN");
  const addingSA = !target.roles.includes("SUPER_ADMIN") && roleNames.includes("SUPER_ADMIN");
  if ((removingSA || addingSA) && !isSA) {
    throw ApiError.forbidden("Only a SUPER_ADMIN can modify SUPER_ADMIN membership");
  }
  if (removingSA && target.status === "ACTIVE") {
    const n = await activeSuperAdmins(getPool(), null);
    if (n <= 1) throw ApiError.conflict("Cannot remove the last active SUPER_ADMIN's role");
  }
  await withTransaction((conn) => assignRoles(conn, id, roleNames));
  return getUser(id);
}

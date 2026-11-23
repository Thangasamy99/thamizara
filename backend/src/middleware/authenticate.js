import jwt from "jsonwebtoken";
import env from "../config/env.js";
import { getPool } from "../database/pool.js";
import ApiError from "../utils/ApiError.js";

/**
 * Bearer-token authentication. Verifies signature + issuer + audience, then
 * loads the live user with roles and permissions so deactivation and role
 * changes take effect immediately — even before the token expires.
 */
export async function requireAuth(req, _res, next) {
  const header = req.headers.authorization ?? "";
  if (!header.startsWith("Bearer ")) {
    return next(ApiError.unauthorized("Authentication required"));
  }
  let payload;
  try {
    payload = jwt.verify(header.slice(7), env.JWT_ACCESS_SECRET, {
      issuer: env.JWT_ISSUER,
      audience: env.JWT_AUDIENCE,
    });
  } catch {
    return next(ApiError.unauthorized("Invalid or expired token"));
  }

  const [rows] = await getPool().query(
    `SELECT u.id, u.name, u.email, u.status,
            COALESCE(GROUP_CONCAT(DISTINCT r.name), '') AS roles,
            COALESCE(GROUP_CONCAT(DISTINCT p.code), '') AS permissions
       FROM users u
       LEFT JOIN user_roles ur ON ur.user_id = u.id
       LEFT JOIN roles r ON r.id = ur.role_id
       LEFT JOIN role_permissions rp ON rp.role_id = r.id
       LEFT JOIN permissions p ON p.id = rp.permission_id
      WHERE u.id = ? AND u.deleted_at IS NULL
      GROUP BY u.id`,
    [payload.sub],
  );
  const user = rows[0];
  if (!user) return next(ApiError.unauthorized("Account not found"));
  if (user.status !== "ACTIVE") {
    return next(ApiError.unauthorized("Account is not active"));
  }

  req.user = {
    id: user.id,
    name: user.name,
    email: user.email,
    roles: user.roles ? user.roles.split(",") : [],
    permissions: new Set(user.permissions ? user.permissions.split(",") : []),
  };
  next();
}

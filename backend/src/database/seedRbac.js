import { ROLES, PERMISSIONS, ROLE_PERMISSIONS } from "../modules/auth/rbac.data.js";

/**
 * Idempotently inserts all roles, permissions and role_permission rows.
 * `conn` may be a pool or a transactional connection.
 */
export async function seedRbac(conn) {
  for (const name of ROLES) {
    await conn.query("INSERT IGNORE INTO roles (name) VALUES (?)", [name]);
  }
  for (const code of PERMISSIONS) {
    await conn.query("INSERT IGNORE INTO permissions (code) VALUES (?)", [code]);
  }
  const [roles] = await conn.query("SELECT id, name FROM roles");
  const [perms] = await conn.query("SELECT id, code FROM permissions");
  const roleId = Object.fromEntries(roles.map((r) => [r.name, r.id]));
  const permId = Object.fromEntries(perms.map((p) => [p.code, p.id]));
  for (const [role, codes] of Object.entries(ROLE_PERMISSIONS)) {
    for (const code of codes) {
      if (!permId[code]) continue;
      await conn.query(
        "INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES (?, ?)",
        [roleId[role], permId[code]],
      );
    }
  }
}

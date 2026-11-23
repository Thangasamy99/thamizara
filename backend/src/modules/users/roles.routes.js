import { Router } from "express";
import { requireAuth } from "../../middleware/authenticate.js";
import { requirePermission } from "../../middleware/authorize.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ok } from "../../utils/respond.js";
import { getPool } from "../../database/pool.js";

const router = Router();
router.use(requireAuth);

router.get(
  "/",
  requirePermission("users.read"),
  asyncHandler(async (_req, res) => {
    const [rows] = await getPool().query(
      `SELECT r.id, r.name, COALESCE(GROUP_CONCAT(p.code), '') AS permissions
         FROM roles r
         LEFT JOIN role_permissions rp ON rp.role_id = r.id
         LEFT JOIN permissions p ON p.id = rp.permission_id
        GROUP BY r.id ORDER BY r.id`,
    );
    ok(res, "Roles retrieved", {
      roles: rows.map((r) => ({ ...r, permissions: r.permissions ? r.permissions.split(",") : [] })),
    });
  }),
);

export default router;

/** GET /permissions — catalogue of all permission codes. */
export const permissionsRouter = Router()
  .use(requireAuth)
  .get(
    "/",
    requirePermission("users.read"),
    asyncHandler(async (_req, res) => {
      const [rows] = await getPool().query("SELECT id, code FROM permissions ORDER BY code");
      ok(res, "Permissions retrieved", { permissions: rows });
    }),
  );

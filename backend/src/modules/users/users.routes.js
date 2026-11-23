import { Router } from "express";
import { requireAuth } from "../../middleware/authenticate.js";
import { requirePermission } from "../../middleware/authorize.js";
import { validate } from "../../middleware/validate.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ok, created, page } from "../../utils/respond.js";
import { auditReq } from "../../utils/audit.js";
import {
  createUserSchema, updateUserSchema, updateStatusSchema,
  updateRolesSchema, listUsersQuerySchema, idParamSchema,
} from "./users.schemas.js";
import * as svc from "./users.service.js";

const router = Router();
router.use(requireAuth);

router.get(
  "/",
  requirePermission("users.read"),
  validate(listUsersQuerySchema, "query"),
  asyncHandler(async (req, res) => {
    const { rows, total } = await svc.listUsers(req.query);
    page(res, "Users retrieved", rows, { page: req.query.page, limit: req.query.limit, total });
  }),
);

router.get(
  "/:id",
  requirePermission("users.read"),
  validate(idParamSchema, "params"),
  asyncHandler(async (req, res) => ok(res, "User retrieved", { user: await svc.getUser(req.params.id) })),
);

router.post(
  "/",
  requirePermission("users.create"),
  validate(createUserSchema),
  asyncHandler(async (req, res) => {
    const result = await svc.createUser(req.user, req.body);
    await auditReq(req, { action: "user.created", entityType: "user", entityId: result.user.id, summary: `Created user ${result.user.email}` });
    created(res, "User created", result);
  }),
);

router.put(
  "/:id",
  requirePermission("users.update"),
  validate(idParamSchema, "params"),
  validate(updateUserSchema),
  asyncHandler(async (req, res) => {
    const user = await svc.updateUser(req.params.id, req.body);
    await auditReq(req, { action: "user.updated", entityType: "user", entityId: user.id, summary: `Updated user ${user.email}` });
    ok(res, "User updated", { user });
  }),
);

router.patch(
  "/:id/status",
  requirePermission("users.deactivate"),
  validate(idParamSchema, "params"),
  validate(updateStatusSchema),
  asyncHandler(async (req, res) => {
    const user = await svc.setUserStatus(req.user, req.params.id, req.body.status);
    await auditReq(req, { action: `user.status.${req.body.status.toLowerCase()}`, entityType: "user", entityId: user.id, summary: `Status → ${req.body.status}` });
    ok(res, "User status updated", { user });
  }),
);

router.put(
  "/:id/roles",
  requirePermission("users.update"),
  validate(idParamSchema, "params"),
  validate(updateRolesSchema),
  asyncHandler(async (req, res) => {
    const user = await svc.setUserRoles(req.user, req.params.id, req.body.roles);
    await auditReq(req, { action: "user.roles.changed", entityType: "user", entityId: user.id, summary: `Roles → ${req.body.roles.join(", ")}` });
    ok(res, "Roles updated", { user });
  }),
);

export default router;

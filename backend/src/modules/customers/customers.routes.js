import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../../middleware/authenticate.js";
import { requirePermission } from "../../middleware/authorize.js";
import { validate } from "../../middleware/validate.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ok, created, page } from "../../utils/respond.js";
import {
  listCustomersQuerySchema, createCustomerSchema, updateCustomerSchema, customerNoteSchema,
} from "./customers.schemas.js";
import * as svc from "./customers.service.js";

const router = Router();
router.use(requireAuth);
const idParam = z.object({ id: z.coerce.number().int().positive() });

router.get(
  "/",
  requirePermission("customers.read"),
  validate(listCustomersQuerySchema, "query"),
  asyncHandler(async (req, res) => {
    const { rows, total } = await svc.listCustomers(req.query);
    page(res, "Customers retrieved", rows, { page: req.query.page, limit: req.query.limit, total });
  }),
);

router.get(
  "/:id",
  requirePermission("customers.read"),
  validate(idParam, "params"),
  asyncHandler(async (req, res) =>
    ok(res, "Customer retrieved", { customer: await svc.getCustomer(req.params.id) })),
);

router.post(
  "/",
  requirePermission("customers.create"),
  validate(createCustomerSchema),
  asyncHandler(async (req, res) =>
    created(res, "Customer created", { customer: await svc.createCustomer(req.user, req.body, req.ip) })),
);

router.put(
  "/:id",
  requirePermission("customers.update"),
  validate(idParam, "params"),
  validate(updateCustomerSchema),
  asyncHandler(async (req, res) =>
    ok(res, "Customer updated", { customer: await svc.updateCustomer(req.user, req.params.id, req.body, req.ip) })),
);

router.post(
  "/:id/notes",
  requirePermission("customers.update"),
  validate(idParam, "params"),
  validate(customerNoteSchema),
  asyncHandler(async (req, res) =>
    created(res, "Note added", await svc.addNote(req.user, req.params.id, req.body.note, req.ip))),
);

router.get(
  "/:id/activity",
  requirePermission("customers.read"),
  validate(idParam, "params"),
  asyncHandler(async (req, res) =>
    ok(res, "Customer activity", { activity: await svc.customerActivity(req.params.id) })),
);

router.get(
  "/:id/leads",
  requirePermission("customers.read"),
  validate(idParam, "params"),
  asyncHandler(async (req, res) =>
    ok(res, "Customer leads", { leads: await svc.customerLeads(req.params.id) })),
);

export default router;

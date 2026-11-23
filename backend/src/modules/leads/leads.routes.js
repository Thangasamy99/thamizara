import { Router } from "express";
import { requireAuth } from "../../middleware/authenticate.js";
import { requirePermission } from "../../middleware/authorize.js";
import { validate } from "../../middleware/validate.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ok, created, page } from "../../utils/respond.js";
import { z } from "zod";
import {
  listLeadsQuerySchema, createLeadSchema, updateLeadSchema,
  statusSchema, noteSchema, assignSchema, convertSchema,
} from "./leads.schemas.js";
import * as svc from "./leads.service.js";

const router = Router();
router.use(requireAuth);
const idParam = z.object({ id: z.coerce.number().int().positive() });

router.get(
  "/",
  requirePermission("leads.read"),
  validate(listLeadsQuerySchema, "query"),
  asyncHandler(async (req, res) => {
    const { rows, total } = await svc.listLeads(req.query);
    page(res, "Leads retrieved", rows, { page: req.query.page, limit: req.query.limit, total });
  }),
);

router.get(
  "/:id",
  requirePermission("leads.read"),
  validate(idParam, "params"),
  asyncHandler(async (req, res) => ok(res, "Lead retrieved", { lead: await svc.getLead(req.params.id) })),
);

router.post(
  "/",
  requirePermission("leads.create"),
  validate(createLeadSchema),
  asyncHandler(async (req, res) =>
    created(res, "Lead created", { lead: await svc.createLead(req.user, req.body, req.ip) })),
);

router.put(
  "/:id",
  requirePermission("leads.update"),
  validate(idParam, "params"),
  validate(updateLeadSchema),
  asyncHandler(async (req, res) =>
    ok(res, "Lead updated", { lead: await svc.updateLead(req.user, req.params.id, req.body, req.ip) })),
);

router.patch(
  "/:id/status",
  requirePermission("leads.update"),
  validate(idParam, "params"),
  validate(statusSchema),
  asyncHandler(async (req, res) =>
    ok(res, "Lead status updated", { lead: await svc.setLeadStatus(req.user, req.params.id, req.body.status, req.ip) })),
);

router.get(
  "/:id/notes",
  requirePermission("leads.read"),
  validate(idParam, "params"),
  asyncHandler(async (req, res) => ok(res, "Notes retrieved", { notes: await svc.listNotes(req.params.id) })),
);

router.post(
  "/:id/notes",
  requirePermission("leads.update"),
  validate(idParam, "params"),
  validate(noteSchema),
  asyncHandler(async (req, res) =>
    created(res, "Note added", await svc.addNote(req.user, req.params.id, req.body.note, req.ip))),
);

router.post(
  "/:id/assign",
  requirePermission("leads.assign"),
  validate(idParam, "params"),
  validate(assignSchema),
  asyncHandler(async (req, res) =>
    ok(res, "Lead assigned", { lead: await svc.assignLead(req.user, req.params.id, req.body.userId, req.ip) })),
);

router.get(
  "/:id/activity",
  requirePermission("leads.read"),
  validate(idParam, "params"),
  asyncHandler(async (req, res) => ok(res, "Lead activity", { activity: await svc.leadActivity(req.params.id) })),
);

router.post(
  "/:id/convert",
  requirePermission("leads.convert"),
  validate(idParam, "params"),
  validate(convertSchema),
  asyncHandler(async (req, res) => {
    const result = await svc.convertLead(req.user, req.params.id, req.body, req.ip);
    ok(res, `Conversion result: ${result.status}`, result);
  }),
);

export default router;

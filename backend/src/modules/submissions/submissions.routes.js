import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../../middleware/authenticate.js";
import { requirePermission } from "../../middleware/authorize.js";
import { validate } from "../../middleware/validate.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ok, page } from "../../utils/respond.js";
import { DEMO_APPLICATIONS, ENQUIRY_CATEGORIES } from "../public/public.schemas.js";
import * as svc from "./submissions.service.js";

const router = Router();
router.use(requireAuth);
const idParam = z.object({ id: z.coerce.number().int().positive() });

const listQuery = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(150).optional(),
  type: z.enum(["DEMO_REQUEST", "GENERAL_ENQUIRY"]).optional(),
  status: z.enum(["NEW", "CONTACTED", "COMPLETED", "CANCELLED"]).optional(),
  country: z.string().trim().max(100).optional(),
  category: z.enum([...DEMO_APPLICATIONS, ...ENQUIRY_CATEGORIES]).optional(),
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  sort: z.enum(["created_at", "name", "status", "reference"]).default("created_at"),
  order: z.enum(["asc", "desc"]).default("desc"),
});

const statusBody = z.object({
  status: z.enum(["NEW", "CONTACTED", "COMPLETED", "CANCELLED"]),
});

router.get(
  "/",
  requirePermission("leads.read"),
  validate(listQuery, "query"),
  asyncHandler(async (req, res) => {
    const { rows, total } = await svc.listSubmissions(req.query);
    page(res, "Submissions retrieved", rows, { page: req.query.page, limit: req.query.limit, total });
  }),
);

router.get(
  "/stats",
  requirePermission("leads.read"),
  asyncHandler(async (_req, res) => ok(res, "Submission stats", await svc.submissionStats())),
);

router.get(
  "/:id",
  requirePermission("leads.read"),
  validate(idParam, "params"),
  asyncHandler(async (req, res) =>
    ok(res, "Submission retrieved", { submission: await svc.getSubmission(req.params.id) })),
);

router.patch(
  "/:id/status",
  requirePermission("leads.update"),
  validate(idParam, "params"),
  validate(statusBody),
  asyncHandler(async (req, res) =>
    ok(res, "Status updated", {
      submission: await svc.setSubmissionStatus(req.user, req.params.id, req.body.status, req.ip),
    })),
);

export default router;

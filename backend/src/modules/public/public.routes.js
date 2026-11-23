import { Router } from "express";
import { validate } from "../../middleware/validate.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ok } from "../../utils/respond.js";
import {
  contactSchema, quotationRequestSchema, demoRequestSchema, enquirySchema,
} from "./public.schemas.js";
import * as svc from "./public.service.js";

const router = Router();
const ctx = (req) => ({ ip: req.ip });
const idemKey = (req) => req.headers["idempotency-key"];

router.post(
  "/contact",
  validate(contactSchema),
  asyncHandler(async (req, res) => {
    const result = await svc.submitContact(req.body, idemKey(req), ctx(req));
    ok(res, result.message, result, undefined, 201);
  }),
);

router.post(
  "/quotation-requests",
  validate(quotationRequestSchema),
  asyncHandler(async (req, res) => {
    const result = await svc.submitQuotationRequest(req.body, idemKey(req), ctx(req));
    ok(res, result.message, result, undefined, 201);
  }),
);

router.post(
  "/demo-requests",
  validate(demoRequestSchema),
  asyncHandler(async (req, res) => {
    const result = await svc.submitDemoRequest(req.body, idemKey(req), ctx(req));
    ok(res, result.message, result, undefined, 201);
  }),
);

router.post(
  "/enquiries",
  validate(enquirySchema),
  asyncHandler(async (req, res) => {
    const result = await svc.submitEnquiry(req.body, idemKey(req), ctx(req));
    ok(res, result.message, result, undefined, 201);
  }),
);

router.get(
  "/quotation-status/:token",
  asyncHandler(async (req, res) => {
    const data = await svc.quotationStatus(req.params.token);
    ok(res, "Quotation status", data);
  }),
);

export default router;

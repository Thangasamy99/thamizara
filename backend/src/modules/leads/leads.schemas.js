import { z } from "zod";

const trim = (v) => (typeof v === "string" ? v.trim() : v);
const opt = (schema) =>
  z.preprocess((v) => (v === "" || v === undefined ? null : trim(v)), schema.nullable());

export const LEAD_STATUSES = [
  "NEW", "CONTACTED", "QUALIFIED", "PROPOSAL_IN_PROGRESS", "CONVERTED", "LOST", "ON_HOLD",
];

const LEAD_SOURCES = ["contact_form", "quotation_wizard", "admin", "manual", "other"];

export const listLeadsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(150).optional(),
  status: z.enum(LEAD_STATUSES).optional(),
  country: z.string().trim().max(100).optional(),
  city: z.string().trim().max(100).optional(),
  serviceCategory: z.string().trim().max(80).optional(),
  source: z.enum(LEAD_SOURCES).optional(),
  assignedTo: z.coerce.number().int().positive().optional(),
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  sort: z.enum(["created_at", "updated_at", "name", "status", "reference"]).default("created_at"),
  order: z.enum(["asc", "desc"]).default("desc"),
});

const leadFields = {
  name: z.preprocess(trim, z.string().min(2).max(150)),
  businessName: opt(z.string().max(190)),
  email: z.preprocess(trim, z.string().email().max(190)),
  phone: opt(z.string().max(50)),
  whatsapp: opt(z.string().max(50)),
  country: opt(z.string().max(100)),
  city: opt(z.string().max(100)),
  subject: opt(z.string().max(190)),
  serviceCategory: opt(z.string().max(80)),
  serviceLevel: opt(z.string().max(60)),
  projectType: opt(z.string().max(120)),
  description: opt(z.string().max(5000)),
  features: opt(z.array(z.string().max(120)).max(40)),
  existingSoftware: opt(z.string().max(255)),
  approach: opt(z.string().max(80)),
  budgetRange: opt(z.string().max(120)),
  budgetCurrency: opt(z.enum(["XAF", "NGN", "USD"])),
  timeline: opt(z.string().max(80)),
  source: opt(z.enum(["admin", "manual", "other"])),
};

export const createLeadSchema = z.object(leadFields).strict();
const { source: _drop, ...updatable } = leadFields;
export const updateLeadSchema = z.object(updatable).partial().strict()
  .refine((o) => Object.keys(o).length > 0, { message: "Nothing to update" });

export const statusSchema = z.object({ status: z.enum(LEAD_STATUSES) });
export const noteSchema = z.object({ note: z.preprocess(trim, z.string().min(1).max(2000)) });
export const assignSchema = z.object({ userId: z.coerce.number().int().positive() });

export const convertSchema = z.object({
  // Explicit link to an existing customer (after duplicate review).
  customerId: z.coerce.number().int().positive().optional(),
}).strict();

import { z } from "zod";

const trim = (v) => (typeof v === "string" ? v.trim() : v);
const opt = (schema) =>
  z.preprocess((v) => (v === "" || v === undefined ? null : trim(v)), schema.nullable());

export const CUSTOMER_TYPES = [
  "INDIVIDUAL", "SMALL_BUSINESS", "COMPANY", "EDUCATIONAL_INSTITUTION",
  "HEALTHCARE", "HOSPITALITY", "REAL_ESTATE", "NON_PROFIT", "OTHER",
];

export const listCustomersQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(150).optional(),
  type: z.enum(CUSTOMER_TYPES).optional(),
  country: z.string().trim().max(100).optional(),
  sort: z.enum(["created_at", "updated_at", "name", "reference"]).default("created_at"),
  order: z.enum(["asc", "desc"]).default("desc"),
});

const fields = {
  name: z.preprocess(trim, z.string().min(2).max(150)),
  businessName: opt(z.string().max(190)),
  email: opt(z.string().email().max(190)),
  phone: opt(z.string().max(50)),
  whatsapp: opt(z.string().max(50)),
  country: opt(z.string().max(100)),
  city: opt(z.string().max(100)),
  address: opt(z.string().max(255)),
  type: z.enum(CUSTOMER_TYPES).default("INDIVIDUAL"),
  notes: opt(z.string().max(2000)),
};

export const createCustomerSchema = z.object(fields).strict();
export const updateCustomerSchema = z.object(fields).partial().strict()
  .refine((o) => Object.keys(o).length > 0, { message: "Nothing to update" });

export const customerNoteSchema = z.object({ note: z.preprocess(trim, z.string().min(1).max(2000)) });

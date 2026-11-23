import { z } from "zod";

const trim = (v) => (typeof v === "string" ? v.trim() : v);
// Trims and maps ""→null BEFORE inner validation, then marks optional.
const opt = (schema) =>
  z.preprocess((v) => (v === "" || v === undefined ? null : trim(v)), schema.nullable());

/** POST /api/v1/public/contact — matches the existing contact form fields. */
export const contactSchema = z
  .object({
    name: z.preprocess(trim, z.string().min(2, "Name is required").max(150)),
    email: z.preprocess(trim, z.string().email("Enter a valid email").max(190)),
    phone: opt(z.preprocess(trim, z.string().max(50))),
    whatsapp: opt(z.preprocess(trim, z.string().max(50))),
    country: opt(z.preprocess(trim, z.string().max(100))),
    city: opt(z.preprocess(trim, z.string().max(100))),
    // `type` is the existing form's "What do you need?" select; `subject` is
    // accepted for forward compatibility.
    type: opt(z.preprocess(trim, z.string().max(120))),
    subject: opt(z.preprocess(trim, z.string().max(190))),
    message: z.preprocess(trim, z.string().min(10, "Tell us a little more about your enquiry").max(3000)),
    // Honeypot — must stay empty; bots filling it are rejected silently.
    website: opt(z.string().max(0, "Invalid submission")),
  })
  .strict();

const KNOWN_SERVICES = [
  "small-business", "student-projects", "education", "healthcare",
  "property-hospitality", "custom-software",
];
const KNOWN_TIERS = ["starter", "business", "enterprise"];

/* ── Simplified enquiry model (Phase 5) ───────────────────── */

export const DEMO_APPLICATIONS = [
  "Hospital Management System",
  "Eye Hospital Management System",
  "School Management System",
  "Property Management System",
  "E-Commerce Platform",
  "Church Management System",
  "Hotel Management System",
  "Hostel Management System",
  "Custom Software",
];

export const ENQUIRY_CATEGORIES = [
  "Software Development",
  "Website Development",
  "Mobile Application",
  "Existing Software / Product",
  "Student Technical Mentoring",
  "Pricing and Services",
  "Partnership",
  "Technical Support",
  "Other",
];

/** POST /api/v1/public/demo-requests */
export const demoRequestSchema = z
  .object({
    name: z.preprocess(trim, z.string().min(2, "Name is required").max(150)),
    email: z.preprocess(trim, z.string().email("Enter a valid email").max(190)),
    phone: z.preprocess(trim, z.string().min(5, "Phone / WhatsApp number is required").max(50)),
    country: z.preprocess(trim, z.string().min(2, "Country is required").max(100)),
    organization: opt(z.preprocess(trim, z.string().max(190))),
    application: z.enum(DEMO_APPLICATIONS),
    message: opt(z.preprocess(trim, z.string().max(3000))),
    website: opt(z.string().max(0, "Invalid submission")),
  })
  .strict();

/** POST /api/v1/public/enquiries */
export const enquirySchema = z
  .object({
    name: z.preprocess(trim, z.string().min(2, "Name is required").max(150)),
    email: z.preprocess(trim, z.string().email("Enter a valid email").max(190)),
    phone: opt(z.preprocess(trim, z.string().max(50))),
    country: z.preprocess(trim, z.string().min(2, "Country is required").max(100)),
    category: z.enum(ENQUIRY_CATEGORIES),
    message: z.preprocess(trim, z.string().min(5, "Tell us a little more").max(3000)),
    website: opt(z.string().max(0, "Invalid submission")),
  })
  .strict();

/** POST /api/v1/public/quotation-requests — matches the 4-step wizard payload. */
export const quotationRequestSchema = z
  .object({
    name: z.preprocess(trim, z.string().min(2).max(150)),
    business: opt(z.preprocess(trim, z.string().max(190))),
    email: z.preprocess(trim, z.string().email("Enter a valid email").max(190)),
    whatsapp: opt(z.preprocess(trim, z.string().max(50))),
    country: opt(z.preprocess(trim, z.string().max(100))),
    city: opt(z.preprocess(trim, z.string().max(100))),
    serviceCategory: z.preprocess(trim, z.string().min(2).max(80))
      .refine((v) => KNOWN_SERVICES.includes(v), "Unknown service category"),
    serviceLevel: opt(z.preprocess(trim, z.string().max(60))
      .refine((v) => v == null || KNOWN_TIERS.includes(v), "Unknown service level")),
    projectType: z.preprocess(trim, z.string().min(2).max(120)),
    description: z.preprocess(trim, z.string().min(10, "Describe your project").max(5000)),
    features: z.array(z.preprocess(trim, z.string().min(1).max(120))).min(1).max(40),
    existingSoftware: opt(z.preprocess(trim, z.string().max(255))),
    approach: opt(z.preprocess(trim, z.string().max(80))),
    budget: z.preprocess(trim, z.string().min(1, "Select a budget range").max(120)),
    timeline: z.preprocess(trim, z.string().min(1).max(80)),
    currency: z.enum(["XAF", "NGN", "USD"]),
    website: opt(z.string().max(0, "Invalid submission")),
  })
  .strict();

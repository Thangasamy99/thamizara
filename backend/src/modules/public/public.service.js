import env from "../../config/env.js";
import { getPool } from "../../database/pool.js";
import ApiError from "../../utils/ApiError.js";
import { randomToken, sha256 } from "../../utils/crypto.js";
import { idempotent } from "./idempotency.js";
import { enqueueEmail, deliverPending } from "../../services/notifications.js";
import {
  customerContactAck, customerQuotationAck, adminContactAlert, adminQuotationAlert,
} from "../../services/emailTemplates.js";
import { audit } from "../../utils/audit.js";
import { nextReference } from "../../utils/reference.js";

const tryDeliver = () => {
  if (env.NOTIFICATION_AUTODELIVER) deliverPending().catch(() => {});
};

const SERVICE_LABELS = {
  "small-business": "Small Business Solutions",
  "student-projects": "Student Project Services",
  education: "Education Solutions",
  healthcare: "Healthcare Solutions",
  "property-hospitality": "Property & Hospitality Solutions",
  "custom-software": "Custom Software Development",
};

/* ── Contact form ─────────────────────────────────────────── */

export async function submitContact(body, idemKey, ctx) {
  const { data, replayed } = await idempotent("contact", idemKey, body, async (conn) => {
    const ref = await nextReference(conn, "lead");
    const subject = body.subject ?? (body.type ? `Project enquiry — ${body.type}` : "Contact enquiry");
    const [r] = await conn.query(
      `INSERT INTO leads (reference, name, email, whatsapp, phone, subject, country, city,
                          project_type, description, source, status, idempotency_key)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'contact_form', 'NEW', ?)`,
      [ref, body.name, body.email, body.whatsapp ?? null, body.phone ?? null, subject,
       body.country ?? null, body.city ?? null, body.type ?? null, body.message, idemKey],
    );
    return { leadId: r.insertId, reference: ref };
  });

  if (!replayed) {
    await audit({ action: "lead.created", entityType: "lead", entityId: data.leadId, summary: `Contact form lead ${data.reference} (${body.email})`, ip: ctx.ip });
    // Notifications are best-effort — enqueueing is awaited (cheap INSERT) so
    // pending rows exist deterministically; delivery itself never throws.
    await Promise.allSettled([
      enqueueEmail({ to: body.email, type: "contact_ack", entityType: "lead", entityId: data.leadId, ...customerContactAck({ name: body.name, reference: data.reference }) }),
      ...env.ADMIN_NOTIFY_EMAILS.map((to) =>
        enqueueEmail({ to, type: "contact_alert", entityType: "lead", entityId: data.leadId, ...adminContactAlert({ reference: data.reference, name: body.name, email: body.email, type: body.type ?? "General", message: body.message }) })),
    ]);
    tryDeliver();
  }

  return {
    reference: data.reference,
    status: "received",
    message: "Thank you — your enquiry has been received. We will reply within 1–2 business days.",
    duplicate: replayed,
  };
}

/* ── Quotation request ────────────────────────────────────── */

export async function submitQuotationRequest(body, idemKey, ctx) {
  const { data, replayed } = await idempotent("quotation-request", idemKey, body, async (conn) => {
    const leadRef = await nextReference(conn, "lead");
    const quoteRef = await nextReference(conn, "quotation");
    const statusToken = randomToken(32); // customer-facing status lookup key
    const title = `${SERVICE_LABELS[body.serviceCategory] ?? body.serviceCategory} — ${body.projectType}`;

    const [lr] = await conn.query(
      `INSERT INTO leads (reference, name, business_name, email, whatsapp, country, city,
                          service_category, service_level, project_type, description, features,
                          existing_software, approach, budget_range, budget_currency, timeline,
                          source, status, idempotency_key)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'quotation_wizard', 'NEW', ?)`,
      [leadRef, body.name, body.business ?? null, body.email, body.whatsapp ?? null,
       body.country ?? null, body.city ?? null, body.serviceCategory, body.serviceLevel ?? null,
       body.projectType, body.description, JSON.stringify(body.features),
       body.existingSoftware ?? null, body.approach ?? null, body.budget, body.currency,
       body.timeline, idemKey],
    );
    const [qr] = await conn.query(
      `INSERT INTO quotations (quote_number, lead_id, title, service_category, description, features,
                               budget_range, budget_currency, timeline, currency, status, public_token)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'REQUESTED', ?)`,
      [quoteRef, lr.insertId, title, body.serviceCategory, body.description,
       JSON.stringify(body.features), body.budget, body.currency, body.timeline,
       body.currency, sha256(statusToken)],
    );
    return {
      leadId: lr.insertId, quotationId: qr.insertId,
      reference: quoteRef, leadReference: leadRef, statusToken,
    };
  });

  if (!replayed) {
    await audit({ action: "quotation.requested", entityType: "quotation", entityId: data.quotationId, summary: `Public quotation request ${data.reference} (${body.email})`, ip: ctx.ip });
    await Promise.allSettled([
      enqueueEmail({ to: body.email, type: "quotation_ack", entityType: "quotation", entityId: data.quotationId, ...customerQuotationAck({ name: body.name, reference: data.reference, currency: body.currency }) }),
      ...env.ADMIN_NOTIFY_EMAILS.map((to) =>
        enqueueEmail({ to, type: "quotation_alert", entityType: "quotation", entityId: data.quotationId, ...adminQuotationAlert({ reference: data.reference, name: body.name, email: body.email, serviceCategory: SERVICE_LABELS[body.serviceCategory] ?? body.serviceCategory, currency: body.currency, budget: body.budget }) })),
    ]);
    tryDeliver();
  }

  return {
    reference: data.reference,
    statusToken: data.statusToken,
    status: "REQUESTED",
    message: "Your quotation request has been received. Our team will review your requirements and prepare a customised quotation.",
    duplicate: replayed,
  };
}

/* ── Public status lookup ─────────────────────────────────── */

export async function quotationStatus(token) {
  if (!token || token.length < 20 || token.length > 128) {
    throw ApiError.notFound("Quotation not found or link expired");
  }
  const [rows] = await getPool().query(
    `SELECT quote_number, service_category, status, budget_range, currency, budget_currency,
            title, valid_until, total, created_at
       FROM quotations WHERE public_token = ? AND deleted_at IS NULL`,
    [sha256(token)],
  );
  const q = rows[0];
  if (!q) throw ApiError.notFound("Quotation not found or link expired");

  // Status tokens expire — older enquiries must be queried via email.
  const ageDays = (Date.now() - new Date(q.created_at).getTime()) / 86_400_000;
  if (ageDays > env.STATUS_TOKEN_TTL_DAYS) {
    throw ApiError.notFound("Quotation not found or link expired");
  }

  // Customer-safe projection only — no ids, notes, revisions or internals.
  const sentOrLater = ["SENT", "ACCEPTED", "REJECTED"].includes(q.status);
  return {
    reference: q.quote_number,
    title: q.title,
    serviceCategory: q.service_category,
    status: q.status,
    submittedAt: q.created_at,
    currency: q.currency,
    budgetRange: q.budget_range,
    // Amounts are revealed only once an authorised quotation has been sent.
    ...(sentOrLater ? { total: q.total, validUntil: q.valid_until } : {}),
  };
}

/* ── Simplified enquiry model (Phase 5) ──────────────────────
 * Demo requests and general enquiries are stored as leads with a
 * submission_type. No emails or WhatsApp messages are sent — the team
 * contacts customers manually. */

const DEMO_SUBJECT = "Demo request";
const ENQUIRY_SUBJECT = "General enquiry";

async function storeSimpleSubmission({ scope, kind, idemKey, body, columns, ctx }) {
  const { data, replayed } = await idempotent(scope, idemKey, body, async (conn) => {
    const ref = await nextReference(conn, kind);
    const [r] = await conn.query(
      `INSERT INTO leads (reference, name, business_name, email, phone, country,
                          subject, service_category, description,
                          source, submission_type, status, idempotency_key)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'contact_form', ?, 'NEW', ?)`,
      [ref, body.name, columns.businessName, body.email, body.phone ?? null,
       body.country, columns.subject, columns.category, columns.description,
       columns.type, idemKey],
    );
    return { leadId: r.insertId, reference: ref };
  });
  if (!replayed) {
    await audit({
      action: "lead.created", entityType: "lead", entityId: data.leadId,
      summary: `${columns.type} ${data.reference} (${body.email})`, ip: ctx.ip,
    });
  }
  return {
    reference: data.reference,
    status: "received",
    message: "Thank you — your submission has been received. We will contact you soon.",
    duplicate: replayed,
  };
}

/** POST /api/v1/public/demo-requests */
export async function submitDemoRequest(body, idemKey, ctx) {
  return storeSimpleSubmission({
    scope: "demo-request", kind: "demo", idemKey, body, ctx,
    columns: {
      businessName: body.organization ?? null,
      subject: `${DEMO_SUBJECT} — ${body.application}`,
      category: body.application,
      description: body.message ?? null,
      type: "DEMO_REQUEST",
    },
  });
}

/** POST /api/v1/public/enquiries */
export async function submitEnquiry(body, idemKey, ctx) {
  return storeSimpleSubmission({
    scope: "general-enquiry", kind: "enquiry", idemKey, body, ctx,
    columns: {
      businessName: null,
      subject: `${ENQUIRY_SUBJECT} — ${body.category}`,
      category: body.category,
      description: body.message,
      type: "GENERAL_ENQUIRY",
    },
  });
}

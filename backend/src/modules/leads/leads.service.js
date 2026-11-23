import { getPool, withTransaction } from "../../database/pool.js";
import ApiError from "../../utils/ApiError.js";
import { audit } from "../../utils/audit.js";
import { nextReference } from "../../utils/reference.js";

const shape = (l) => ({
  id: l.id,
  reference: l.reference,
  name: l.name,
  businessName: l.business_name,
  email: l.email,
  phone: l.phone,
  whatsapp: l.whatsapp,
  country: l.country,
  city: l.city,
  subject: l.subject,
  serviceCategory: l.service_category,
  serviceLevel: l.service_level,
  projectType: l.project_type,
  description: l.description,
  features: l.features,
  existingSoftware: l.existing_software,
  approach: l.approach,
  budgetRange: l.budget_range,
  budgetCurrency: l.budget_currency,
  timeline: l.timeline,
  source: l.source,
  status: l.status,
  assignedTo: l.assigned_to,
  assignedName: l.assigned_name ?? null,
  convertedCustomerId: l.converted_customer_id,
  createdAt: l.created_at,
  updatedAt: l.updated_at,
});

const SELECT = `
  SELECT l.*, u.name AS assigned_name
    FROM leads l
    LEFT JOIN users u ON u.id = l.assigned_to`;

const SORTS = {
  created_at: "l.created_at", updated_at: "l.updated_at",
  name: "l.name", status: "l.status", reference: "l.reference",
};

export async function listLeads(q) {
  const pool = getPool();
  const where = ["l.deleted_at IS NULL"];
  const params = [];
  const add = (cond, ...vals) => { where.push(cond); params.push(...vals); };

  if (q.status) add("l.status = ?", q.status);
  if (q.country) add("l.country = ?", q.country);
  if (q.city) add("l.city = ?", q.city);
  if (q.serviceCategory) add("l.service_category = ?", q.serviceCategory);
  if (q.source) add("l.source = ?", q.source);
  if (q.assignedTo) add("l.assigned_to = ?", q.assignedTo);
  if (q.from) add("l.created_at >= ?", `${q.from} 00:00:00`);
  if (q.to) add("l.created_at <= ?", `${q.to} 23:59:59`);
  if (q.search) {
    add("(l.name LIKE ? OR l.email LIKE ? OR l.phone LIKE ? OR l.whatsapp LIKE ? OR l.business_name LIKE ? OR l.reference LIKE ?)",
      ...Array(6).fill(`%${q.search}%`));
  }
  const clause = where.join(" AND ");
  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) AS total FROM leads l WHERE ${clause}`, params,
  );
  const [rows] = await pool.query(
    `${SELECT} WHERE ${clause} ORDER BY ${SORTS[q.sort]} ${q.order === "asc" ? "ASC" : "DESC"}
     LIMIT ? OFFSET ?`,
    [...params, q.limit, (q.page - 1) * q.limit],
  );
  return { rows: rows.map(shape), total };
}

export async function getLead(id) {
  const [rows] = await getPool().query(`${SELECT} WHERE l.id = ? AND l.deleted_at IS NULL`, [id]);
  if (!rows[0]) throw ApiError.notFound("Lead not found");
  const lead = shape(rows[0]);

  const [notes] = await getPool().query(
    `SELECT n.id, n.note, n.created_at, u.name AS author
       FROM lead_notes n LEFT JOIN users u ON u.id = n.user_id
      WHERE n.lead_id = ? ORDER BY n.id DESC`, [id],
  );
  const [assignments] = await getPool().query(
    `SELECT a.id, a.created_at, t.name AS assignedTo, b.name AS assignedBy
       FROM lead_assignments a
       LEFT JOIN users t ON t.id = a.assigned_to
       LEFT JOIN users b ON b.id = a.assigned_by
      WHERE a.lead_id = ? ORDER BY a.id DESC`, [id],
  );
  const [quotations] = await getPool().query(
    `SELECT id, quote_number, status, currency, total, created_at
       FROM quotations WHERE lead_id = ? AND deleted_at IS NULL ORDER BY id DESC`, [id],
  );
  return { ...lead, notes, assignments, quotations };
}

export async function createLead(actor, body, ip) {
  const lead = await withTransaction(async (conn) => {
    const reference = await nextReference(conn, "lead");
    const [r] = await conn.query(
      `INSERT INTO leads (reference, name, business_name, email, phone, whatsapp, country, city,
                          subject, service_category, service_level, project_type, description, features,
                          existing_software, approach, budget_range, budget_currency, timeline,
                          source, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'NEW')`,
      [reference, body.name, body.businessName, body.email, body.phone, body.whatsapp,
       body.country, body.city, body.subject, body.serviceCategory, body.serviceLevel,
       body.projectType, body.description, body.features ? JSON.stringify(body.features) : null,
       body.existingSoftware, body.approach, body.budgetRange, body.budgetCurrency,
       body.timeline, body.source ?? "admin"],
    );
    return { id: r.insertId, reference };
  });
  await audit({ actorId: actor.id, action: "lead.created", entityType: "lead", entityId: lead.id, summary: `Manual lead ${lead.reference} (${body.email})`, ip });
  return getLead(lead.id);
}

const COLUMN = {
  businessName: "business_name", phone: "phone", whatsapp: "whatsapp", country: "country",
  city: "city", subject: "subject", serviceCategory: "service_category",
  serviceLevel: "service_level", projectType: "project_type", description: "description",
  existingSoftware: "existing_software", approach: "approach", budgetRange: "budget_range",
  budgetCurrency: "budget_currency", timeline: "timeline", name: "name", email: "email",
};

export async function updateLead(actor, id, body, ip) {
  await getLead(id); // 404 guard
  const fields = [];
  const params = [];
  for (const [key, col] of Object.entries(COLUMN)) {
    if (body[key] !== undefined) { fields.push(`${col} = ?`); params.push(body[key]); }
  }
  if (body.features !== undefined) { fields.push("features = ?"); params.push(body.features ? JSON.stringify(body.features) : null); }
  await getPool().query(`UPDATE leads SET ${fields.join(", ")} WHERE id = ?`, [...params, id]);
  await audit({ actorId: actor.id, action: "lead.updated", entityType: "lead", entityId: id, summary: `Updated fields: ${Object.keys(body).join(", ")}`, ip });
  return getLead(id);
}

/* ── Status transitions ───────────────────────────────────── */

const TRANSITIONS = {
  NEW: ["CONTACTED", "ON_HOLD", "LOST"],
  CONTACTED: ["QUALIFIED", "ON_HOLD", "LOST"],
  QUALIFIED: ["PROPOSAL_IN_PROGRESS", "ON_HOLD", "LOST"],
  PROPOSAL_IN_PROGRESS: ["QUALIFIED", "ON_HOLD", "LOST"],
  ON_HOLD: ["NEW", "CONTACTED", "LOST"],
  LOST: ["NEW"],
  CONVERTED: [],
};

export async function setLeadStatus(actor, id, status, ip) {
  const lead = await getLead(id);
  if (status === "CONVERTED") {
    throw ApiError.badRequest("Use the convert endpoint to convert a lead");
  }
  if (lead.status === "CONVERTED") {
    throw ApiError.conflict("A converted lead's status cannot be changed");
  }
  if (!TRANSITIONS[lead.status].includes(status)) {
    throw ApiError.badRequest(`Invalid transition ${lead.status} → ${status}`);
  }
  await getPool().query("UPDATE leads SET status = ? WHERE id = ?", [status, id]);
  await audit({ actorId: actor.id, action: "lead.status.changed", entityType: "lead", entityId: id, summary: `${lead.reference}: ${lead.status} → ${status}`, ip });
  return getLead(id);
}

/* ── Notes ────────────────────────────────────────────────── */

export async function addNote(actor, id, note, ip) {
  await getLead(id);
  const [r] = await getPool().query(
    "INSERT INTO lead_notes (lead_id, user_id, note) VALUES (?, ?, ?)", [id, actor.id, note],
  );
  await audit({ actorId: actor.id, action: "lead.note.added", entityType: "lead", entityId: id, ip });
  return { id: r.insertId };
}

export async function listNotes(id) {
  await getLead(id);
  const [rows] = await getPool().query(
    `SELECT n.id, n.note, n.created_at, u.name AS author
       FROM lead_notes n LEFT JOIN users u ON u.id = n.user_id
      WHERE n.lead_id = ? ORDER BY n.id DESC`, [id],
  );
  return rows;
}

/* ── Assignment ───────────────────────────────────────────── */

export async function assignLead(actor, id, userId, ip) {
  const lead = await getLead(id);
  const [users] = await getPool().query(
    "SELECT id, name, status FROM users WHERE id = ? AND deleted_at IS NULL", [userId],
  );
  if (!users[0]) throw ApiError.notFound("User not found");
  if (users[0].status !== "ACTIVE") throw ApiError.badRequest("Cannot assign to an inactive user");

  await withTransaction(async (conn) => {
    await conn.query(
      "INSERT INTO lead_assignments (lead_id, assigned_to, assigned_by) VALUES (?, ?, ?)",
      [id, userId, actor.id],
    );
    await conn.query("UPDATE leads SET assigned_to = ? WHERE id = ?", [userId, id]);
  });
  await audit({
    actorId: actor.id, action: "lead.assigned", entityType: "lead", entityId: id,
    summary: `${lead.reference}: ${lead.assignedName ?? "unassigned"} → ${users[0].name}`, ip,
  });
  return getLead(id);
}

/* ── Activity ─────────────────────────────────────────────── */

export async function leadActivity(id) {
  await getLead(id);
  const [rows] = await getPool().query(
    `SELECT a.id, a.action, a.summary, a.created_at, u.name AS actor
       FROM activity_logs a LEFT JOIN users u ON u.id = a.actor_id
      WHERE a.entity_type = 'lead' AND a.entity_id = ?
      ORDER BY a.id DESC LIMIT 100`, [id],
  );
  return rows;
}

/* ── Conversion ───────────────────────────────────────────── */

const normEmail = (e) => e?.trim().toLowerCase() ?? null;
const normPhone = (p) => (p ? p.replace(/\D/g, "").replace(/^0+/, "") : null);

/** Candidate customers that may already represent this lead. */
async function findDuplicateCustomers(conn, lead) {
  const email = normEmail(lead.email);
  const phones = [normPhone(lead.phone), normPhone(lead.whatsapp)].filter(Boolean);
  const conds = [];
  const params = [];
  if (email) { conds.push("LOWER(email) = ?"); params.push(email); }
  for (const p of phones) {
    if (p.length >= 6) {
      conds.push("REPLACE(REPLACE(REPLACE(REPLACE(COALESCE(phone,''),' ',''),'-',''),'+',''),'(0)','') LIKE ?");
      params.push(`%${p}`);
      conds.push("REPLACE(REPLACE(REPLACE(REPLACE(COALESCE(whatsapp,''),' ',''),'-',''),'+',''),'(0)','') LIKE ?");
      params.push(`%${p}`);
    }
  }
  if (lead.business_name && lead.country) {
    conds.push("(business_name LIKE ? AND country = ?)");
    params.push(`%${lead.business_name}%`, lead.country);
  }
  if (!conds.length) return [];
  const [rows] = await conn.query(
    `SELECT id, reference, name, business_name, email, phone, whatsapp, country, city, type
       FROM customers WHERE deleted_at IS NULL AND (${conds.join(" OR ")}) LIMIT 5`,
    params,
  );
  return rows;
}

export async function convertLead(actor, id, { customerId }, ip) {
  const audits = [];
  const result = await withTransaction(async (conn) => {
    // Lock the lead row — concurrent conversions serialise here.
    const [rows] = await conn.query(
      "SELECT * FROM leads WHERE id = ? AND deleted_at IS NULL FOR UPDATE", [id],
    );
    const lead = rows[0];
    if (!lead) throw ApiError.notFound("Lead not found");

    // Idempotent: already converted → return the existing association.
    if (lead.converted_customer_id) {
      const [c] = await conn.query(
        "SELECT id, reference, name, email FROM customers WHERE id = ?", [lead.converted_customer_id],
      );
      return { status: "already_converted", customer: c[0] ?? null, leadReference: lead.reference };
    }

    // Explicit link to an existing customer (after duplicate review).
    if (customerId) {
      const [c] = await conn.query(
        "SELECT id, reference, name FROM customers WHERE id = ? AND deleted_at IS NULL", [customerId],
      );
      if (!c[0]) throw ApiError.notFound("Customer not found");
      await conn.query(
        "UPDATE leads SET converted_customer_id = ?, status = 'CONVERTED' WHERE id = ?",
        [customerId, id],
      );
      await conn.query(
        "UPDATE quotations SET customer_id = ? WHERE lead_id = ? AND customer_id IS NULL",
        [customerId, id],
      );
      await conn.query(
        "INSERT INTO lead_notes (lead_id, user_id, note) VALUES (?, ?, ?)",
        [id, actor.id, `Linked to existing customer ${c[0].reference} after duplicate review`],
      );
      audits.push({
        action: "lead.linked_to_customer", entityType: "lead", entityId: id,
        summary: `${lead.reference} linked to ${c[0].reference}`,
      });
      return { status: "linked", customer: c[0], leadReference: lead.reference };
    }

    // No explicit link → check for duplicate candidates first.
    const candidates = await findDuplicateCustomers(conn, lead);
    if (candidates.length) {
      return { status: "duplicate_candidates", candidates, leadReference: lead.reference };
    }

    // Create a fresh customer from the lead's contact data.
    const reference = await nextReference(conn, "customer");
    const [cr] = await conn.query(
      `INSERT INTO customers (reference, name, business_name, email, phone, whatsapp,
                              country, city, type, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'INDIVIDUAL', ?)`,
      [reference, lead.name, lead.business_name, lead.email, lead.phone, lead.whatsapp,
       lead.country, lead.city, actor.id],
    );
    const newCustomerId = cr.insertId;
    await conn.query(
      "UPDATE leads SET converted_customer_id = ?, status = 'CONVERTED' WHERE id = ?",
      [newCustomerId, id],
    );
    await conn.query(
      "UPDATE quotations SET customer_id = ? WHERE lead_id = ? AND customer_id IS NULL",
      [newCustomerId, id],
    );
    audits.push({
      action: "lead.converted", entityType: "lead", entityId: id,
      summary: `${lead.reference} → customer ${reference}`,
    });
    audits.push({
      action: "customer.created", entityType: "customer", entityId: newCustomerId,
      summary: `${reference} created from lead ${lead.reference}`,
    });
    const [c] = await conn.query(
      "SELECT id, reference, name, email FROM customers WHERE id = ?", [newCustomerId],
    );
    return { status: "converted", customer: c[0], leadReference: lead.reference };
  });
  // Audit only after commit — a rolled-back conversion leaves no false trail.
  for (const a of audits) await audit({ ...a, actorId: actor.id, ip });
  return result;
}

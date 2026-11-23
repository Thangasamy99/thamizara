import { getPool } from "../../database/pool.js";
import ApiError from "../../utils/ApiError.js";
import { audit } from "../../utils/audit.js";

/**
 * Simplified admin inbox — reads the `leads` rows created by the
 * Request-Demo and General-Enquiry public forms (submission_type set).
 * No CRM machinery — just list, detail, stats and status follow-up.
 */

const shape = (l) => ({
  id: l.id,
  reference: l.reference,
  type: l.submission_type,
  name: l.name,
  organization: l.business_name,
  email: l.email,
  phone: l.phone,
  whatsapp: l.whatsapp,
  country: l.country,
  city: l.city,
  subject: l.subject,
  category: l.service_category,
  message: l.description,
  status: l.status,
  createdAt: l.created_at,
  updatedAt: l.updated_at,
});

const SORTS = { created_at: "created_at", name: "name", status: "status", reference: "reference" };

export async function listSubmissions(q) {
  const pool = getPool();
  const where = ["submission_type IS NOT NULL", "deleted_at IS NULL"];
  const params = [];
  const add = (cond, ...vals) => { where.push(cond); params.push(...vals); };

  if (q.type) add("submission_type = ?", q.type);
  if (q.status) add("status = ?", q.status);
  if (q.country) add("country = ?", q.country);
  if (q.category) add("service_category = ?", q.category);
  if (q.from) add("created_at >= ?", `${q.from} 00:00:00`);
  if (q.to) add("created_at <= ?", `${q.to} 23:59:59`);
  if (q.search) {
    add("(name LIKE ? OR email LIKE ? OR phone LIKE ? OR business_name LIKE ? OR reference LIKE ?)",
      ...Array(5).fill(`%${q.search}%`));
  }
  const clause = where.join(" AND ");
  const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total FROM leads WHERE ${clause}`, params);
  const [rows] = await pool.query(
    `SELECT * FROM leads WHERE ${clause}
     ORDER BY ${SORTS[q.sort] ?? SORTS.created_at} ${q.order === "asc" ? "ASC" : "DESC"}
     LIMIT ? OFFSET ?`,
    [...params, q.limit, (q.page - 1) * q.limit],
  );
  return { rows: rows.map(shape), total };
}

export async function submissionStats() {
  const [rows] = await getPool().query(
    `SELECT submission_type AS type, status, COUNT(*) AS n
       FROM leads WHERE submission_type IS NOT NULL AND deleted_at IS NULL
      GROUP BY submission_type, status`,
  );
  const stats = {
    totalDemo: 0, newDemo: 0, totalEnquiries: 0, newEnquiries: 0,
    contacted: 0, completed: 0, cancelled: 0,
  };
  for (const r of rows) {
    const n = Number(r.n);
    if (r.type === "DEMO_REQUEST") {
      stats.totalDemo += n;
      if (r.status === "NEW") stats.newDemo += n;
    } else if (r.type === "GENERAL_ENQUIRY") {
      stats.totalEnquiries += n;
      if (r.status === "NEW") stats.newEnquiries += n;
    }
    if (r.status === "CONTACTED") stats.contacted += n;
    if (r.status === "COMPLETED") stats.completed += n;
    if (r.status === "CANCELLED") stats.cancelled += n;
  }
  return stats;
}

export async function getSubmission(id) {
  const [rows] = await getPool().query(
    "SELECT * FROM leads WHERE id = ? AND submission_type IS NOT NULL AND deleted_at IS NULL",
    [id],
  );
  if (!rows[0]) throw ApiError.notFound("Submission not found");
  return shape(rows[0]);
}

/* Simple follow-up workflow: NEW → CONTACTED → COMPLETED, anything → CANCELLED,
 * CANCELLED may be reopened to NEW. */
const TRANSITIONS = {
  NEW: ["CONTACTED", "CANCELLED"],
  CONTACTED: ["COMPLETED", "CANCELLED", "NEW"],
  COMPLETED: ["CONTACTED"],
  CANCELLED: ["NEW"],
};

export async function setSubmissionStatus(actor, id, status, ip) {
  const sub = await getSubmission(id);
  if (!TRANSITIONS[sub.status]?.includes(status)) {
    throw ApiError.badRequest(`Invalid transition ${sub.status} → ${status}`);
  }
  await getPool().query("UPDATE leads SET status = ? WHERE id = ?", [status, id]);
  await audit({
    actorId: actor.id, action: "submission.status.changed", entityType: "lead", entityId: id,
    summary: `${sub.reference}: ${sub.status} → ${status}`, ip,
  });
  return getSubmission(id);
}

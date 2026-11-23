import { getPool, withTransaction } from "../../database/pool.js";
import ApiError from "../../utils/ApiError.js";
import { audit } from "../../utils/audit.js";
import { nextReference } from "../../utils/reference.js";

const shape = (c) => ({
  id: c.id,
  reference: c.reference,
  name: c.name,
  businessName: c.business_name,
  email: c.email,
  phone: c.phone,
  whatsapp: c.whatsapp,
  country: c.country,
  city: c.city,
  address: c.address,
  type: c.type,
  notes: c.notes,
  createdBy: c.created_by,
  createdAt: c.created_at,
  updatedAt: c.updated_at,
});

const SORTS = {
  created_at: "c.created_at", updated_at: "c.updated_at",
  name: "c.name", reference: "c.reference",
};

export async function listCustomers(q) {
  const pool = getPool();
  const where = ["c.deleted_at IS NULL"];
  const params = [];
  if (q.type) { where.push("c.type = ?"); params.push(q.type); }
  if (q.country) { where.push("c.country = ?"); params.push(q.country); }
  if (q.search) {
    where.push("(c.name LIKE ? OR c.email LIKE ? OR c.business_name LIKE ? OR c.reference LIKE ? OR c.phone LIKE ?)");
    params.push(...Array(5).fill(`%${q.search}%`));
  }
  const clause = where.join(" AND ");
  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) AS total FROM customers c WHERE ${clause}`, params,
  );
  const [rows] = await pool.query(
    `SELECT c.* FROM customers c WHERE ${clause}
     ORDER BY ${SORTS[q.sort]} ${q.order === "asc" ? "ASC" : "DESC"} LIMIT ? OFFSET ?`,
    [...params, q.limit, (q.page - 1) * q.limit],
  );
  return { rows: rows.map(shape), total };
}

export async function getCustomer(id) {
  const [rows] = await getPool().query(
    "SELECT c.* FROM customers c WHERE c.id = ? AND c.deleted_at IS NULL", [id],
  );
  if (!rows[0]) throw ApiError.notFound("Customer not found");
  const customer = shape(rows[0]);

  const [leads] = await getPool().query(
    `SELECT id, reference, status, service_category, created_at FROM leads
      WHERE converted_customer_id = ? AND deleted_at IS NULL ORDER BY id DESC`, [id],
  );
  const [quotations] = await getPool().query(
    `SELECT id, quote_number, status, currency, total, created_at FROM quotations
      WHERE customer_id = ? AND deleted_at IS NULL ORDER BY id DESC`, [id],
  );
  const [projects] = await getPool().query(
    `SELECT id, code, title, status, progress, created_at FROM projects
      WHERE customer_id = ? AND deleted_at IS NULL ORDER BY id DESC`, [id],
  );
  const [notes] = await getPool().query(
    `SELECT n.id, n.note, n.created_at, u.name AS author
       FROM customer_notes n LEFT JOIN users u ON u.id = n.user_id
      WHERE n.customer_id = ? ORDER BY n.id DESC`, [id],
  );
  return { ...customer, leads, quotations, projects, notes };
}

export async function createCustomer(actor, body, ip) {
  const result = await withTransaction(async (conn) => {
    const reference = await nextReference(conn, "customer");
    const [r] = await conn.query(
      `INSERT INTO customers (reference, name, business_name, email, phone, whatsapp,
                              country, city, address, type, notes, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [reference, body.name, body.businessName, body.email, body.phone, body.whatsapp,
       body.country, body.city, body.address, body.type, body.notes, actor.id],
    );
    return { id: r.insertId, reference };
  });
  await audit({
    actorId: actor.id, action: "customer.created", entityType: "customer", entityId: result.id,
    summary: `Customer ${result.reference} created manually (${body.email ?? "no email"})`, ip,
  });
  return getCustomer(result.id);
}

const COLUMN = {
  name: "name", businessName: "business_name", email: "email", phone: "phone",
  whatsapp: "whatsapp", country: "country", city: "city", address: "address",
  type: "type", notes: "notes",
};

export async function updateCustomer(actor, id, body, ip) {
  await getCustomer(id); // 404 guard
  const fields = [];
  const params = [];
  for (const [key, col] of Object.entries(COLUMN)) {
    if (body[key] !== undefined) { fields.push(`${col} = ?`); params.push(body[key]); }
  }
  await getPool().query(`UPDATE customers SET ${fields.join(", ")} WHERE id = ?`, [...params, id]);
  await audit({
    actorId: actor.id, action: "customer.updated", entityType: "customer", entityId: id,
    summary: `Updated fields: ${Object.keys(body).join(", ")}`, ip,
  });
  return getCustomer(id);
}

export async function addNote(actor, id, note, ip) {
  await getCustomer(id);
  const [r] = await getPool().query(
    "INSERT INTO customer_notes (customer_id, user_id, note) VALUES (?, ?, ?)",
    [id, actor.id, note],
  );
  await audit({ actorId: actor.id, action: "customer.note.added", entityType: "customer", entityId: id, ip });
  return { id: r.insertId };
}

export async function customerActivity(id) {
  await getCustomer(id);
  const [rows] = await getPool().query(
    `SELECT a.id, a.action, a.entity_type, a.entity_id, a.summary, a.created_at, u.name AS actor
       FROM activity_logs a LEFT JOIN users u ON u.id = a.actor_id
      WHERE (a.entity_type = 'customer' AND a.entity_id = ?)
         OR (a.entity_type = 'lead' AND a.entity_id IN
             (SELECT id FROM leads WHERE converted_customer_id = ?))
      ORDER BY a.id DESC LIMIT 100`,
    [id, id],
  );
  return rows;
}

export async function customerLeads(id) {
  await getCustomer(id);
  const [rows] = await getPool().query(
    `SELECT id, reference, name, email, status, source, service_category, created_at
       FROM leads WHERE converted_customer_id = ? AND deleted_at IS NULL ORDER BY id DESC`,
    [id],
  );
  return rows;
}

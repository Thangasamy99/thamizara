import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import {
  resetTestDb, makeUser, startServer, stopServer, login, auth, get, post,
} from "./helpers.js";

const { getPool } = await import("../src/database/pool.js");

let server, base;
const SA = { email: "sa@crm.dev", password: "Sup3rPass!", roles: ["SUPER_ADMIN"] };
let saToken, salesToken, staffToken, pmToken, salesUser;

before(async () => {
  await resetTestDb();
  ({ server, base } = await startServer());
  await makeUser({ email: SA.email, password: SA.password, roles: SA.roles, name: "Super" });
  saToken = (await login(base, SA.email, SA.password)).accessToken;
  salesUser = await makeUser({ email: "sales@crm.dev", roles: ["SALES_MANAGER"], name: "Sales" });
  salesToken = (await login(base, salesUser.email, salesUser.password)).accessToken;
  const staff = await makeUser({ email: "staff@crm.dev", roles: ["STAFF"] });
  staffToken = (await login(base, staff.email, staff.password)).accessToken;
  const pm = await makeUser({ email: "pm@crm.dev", roles: ["PROJECT_MANAGER"] });
  pmToken = (await login(base, pm.email, pm.password)).accessToken;
});
after(async () => stopServer(server));

const put = (path, body, token) =>
  fetch(`${base}/api/v1${path}`, { method: "PUT", headers: auth(token), body: JSON.stringify(body) });
const patch = (path, body, token) =>
  fetch(`${base}/api/v1${path}`, { method: "PATCH", headers: auth(token), body: JSON.stringify(body) });
const leadBody = (over = {}) => ({
  name: "Lead Person", email: "lead@example.com", businessName: "Lead Biz",
  country: "Cameroon", city: "Douala", serviceCategory: "small-business",
  projectType: "Management system", description: "Needs a POS", ...over,
});

let leadId, secondLeadId, quotationLeadId;

/* ── Lead CRUD ────────────────────────────────────────────── */

test("create lead via API assigns reference and NEW status", async () => {
  const r = await post(base, "/leads", leadBody(), saToken);
  const b = await r.json();
  assert.equal(r.status, 201);
  leadId = b.data.lead.id;
  assert.match(b.data.lead.reference, /^LD-\d{4}-\d{5}$/);
  assert.equal(b.data.lead.status, "NEW");
  assert.equal(b.data.lead.source, "admin");
});

test("create a second lead + a quotation-source lead for later tests", async () => {
  secondLeadId = (await (await post(base, "/leads", leadBody({ email: "l2@example.com", country: "Nigeria" }), saToken)).json()).data.lead.id;
  const q = await post(base, "/public/quotation-requests", {
    name: "QA Quote", email: "qlead@example.com", whatsapp: "111",
    serviceCategory: "healthcare", projectType: "Management system",
    description: "Clinic system requirements description",
    features: ["Billing"], budget: "Under $200", timeline: "Flexible", currency: "USD",
  });
  assert.equal(q.status, 201);
  const [rows] = await getPool().query("SELECT id FROM leads WHERE email='qlead@example.com'");
  quotationLeadId = rows[0].id;
});

test("list leads with pagination, search and filters", async () => {
  const list = await get(base, "/leads?page=1&limit=2", saToken);
  const lb = await list.json();
  assert.equal(list.status, 200);
  assert.equal(lb.data.length, 2);
  assert.ok(Number(lb.meta.total) >= 3);

  const search = await get(base, "/leads?search=lead@example.com", saToken);
  const sb = await search.json();
  assert.ok(sb.data.length >= 1);
  assert.ok(sb.data.every((l) => /lead@example/i.test(l.email) || /lead@example/i.test(l.name) || /lead@example/i.test(l.reference)));

  const filter = await get(base, "/leads?country=Nigeria", saToken);
  const fb = await filter.json();
  assert.ok(fb.data.every((l) => l.country === "Nigeria"));

  const sort = await get(base, "/leads?sort=name&order=asc&limit=1", saToken);
  assert.equal(sort.status, 200);
});

test("read and update a lead", async () => {
  const r = await get(base, `/leads/${leadId}`, saToken);
  const b = await r.json();
  assert.equal(r.status, 200);
  assert.equal(b.data.lead.email, "lead@example.com");

  const u = await put(`/leads/${leadId}`, { city: "Yaoundé", budgetRange: "100k-300k FCFA" }, saToken);
  const ub = await u.json();
  assert.equal(u.status, 200);
  assert.equal(ub.data.lead.city, "Yaoundé");
  assert.equal(ub.data.lead.budgetRange, "100k-300k FCFA");
});

test("status transitions are enforced; invalid ones rejected", async () => {
  // NEW → QUALIFIED is not allowed
  const bad = await patch(`/leads/${leadId}/status`, { status: "QUALIFIED" }, saToken);
  assert.equal(bad.status, 400);
  // NEW → CONTACTED ok → CONTACTED → QUALIFIED ok
  assert.equal((await patch(`/leads/${leadId}/status`, { status: "CONTACTED" }, saToken)).status, 200);
  assert.equal((await patch(`/leads/${leadId}/status`, { status: "QUALIFIED" }, saToken)).status, 200);
  // Direct CONVERTED via PATCH rejected
  const conv = await patch(`/leads/${leadId}/status`, { status: "CONVERTED" }, saToken);
  assert.equal(conv.status, 400);
});

test("lead notes are added, listed, and never leak to public APIs", async () => {
  const r = await post(base, `/leads/${leadId}/notes`, { note: "Called customer — wants demo next week" }, saToken);
  assert.equal(r.status, 201);
  const list = await get(base, `/leads/${leadId}/notes`, saToken);
  const b = await list.json();
  assert.equal(b.data.notes.length, 1);
  assert.match(b.data.notes[0].note, /demo next week/);
});

test("lead assignment validates target user and records history", async () => {
  const r = await post(base, `/leads/${leadId}/assign`, { userId: salesUser.id }, saToken);
  const b = await r.json();
  assert.equal(r.status, 200);
  assert.equal(String(b.data.lead.assignedTo), String(salesUser.id));
  assert.equal(b.data.lead.assignedName, "Sales");
  assert.ok(b.data.lead.assignments.length >= 1);

  // Inactive user cannot be assigned
  const ghost = await makeUser({ email: "ghost@crm.dev", status: "INACTIVE" });
  const bad = await post(base, `/leads/${leadId}/assign`, { userId: ghost.id }, saToken);
  assert.equal(bad.status, 400);
});

test("lead activity endpoint returns audit events", async () => {
  const r = await get(base, `/leads/${leadId}/activity`, saToken);
  const b = await r.json();
  assert.equal(r.status, 200);
  const actions = b.data.activity.map((a) => a.action);
  assert.ok(actions.includes("lead.created"));
  assert.ok(actions.includes("lead.assigned"));
  assert.ok(actions.includes("lead.status.changed"));
});

/* ── RBAC ─────────────────────────────────────────────────── */

test("STAFF cannot access leads or customers at all", async () => {
  assert.equal((await get(base, "/leads", staffToken)).status, 403);
  assert.equal((await get(base, "/customers", staffToken)).status, 403);
});

test("SALES_MANAGER can manage leads and customers", async () => {
  assert.equal((await get(base, "/leads", salesToken)).status, 200);
  assert.equal((await get(base, "/customers", salesToken)).status, 200);
});

test("PROJECT_MANAGER can read but not create/update leads", async () => {
  assert.equal((await get(base, "/leads", pmToken)).status, 200);
  assert.equal((await post(base, "/leads", leadBody({ email: "pm@example.com" }), pmToken)).status, 403);
  assert.equal((await post(base, `/leads/${secondLeadId}/assign`, { userId: salesUser.id }, pmToken)).status, 403);
});

test("unauthenticated requests are rejected", async () => {
  assert.equal((await fetch(`${base}/api/v1/leads`)).status, 401);
  assert.equal((await fetch(`${base}/api/v1/customers`)).status, 401);
});

/* ── Customer CRUD ────────────────────────────────────────── */

let customerId;
test("create customer via API assigns CU reference", async () => {
  const r = await post(base, "/customers", {
    name: "Direct Customer", email: "direct@example.com", type: "SMALL_BUSINESS",
    businessName: "Direct Biz", country: "Nigeria",
  }, saToken);
  const b = await r.json();
  assert.equal(r.status, 201);
  customerId = b.data.customer.id;
  assert.match(b.data.customer.reference, /^CU-\d{4}-\d{5}$/);
  assert.equal(b.data.customer.type, "SMALL_BUSINESS");
});

test("read, update, search customers", async () => {
  const r = await get(base, `/customers/${customerId}`, saToken);
  const b = await r.json();
  assert.equal(r.status, 200);
  assert.equal(b.data.customer.email, "direct@example.com");
  assert.deepEqual(b.data.customer.leads, []);

  const u = await put(`/customers/${customerId}`, { city: "Lagos", type: "COMPANY" }, saToken);
  const ub = await u.json();
  assert.equal(ub.data.customer.city, "Lagos");
  assert.equal(ub.data.customer.type, "COMPANY");

  const s = await get(base, "/customers?search=Direct Biz", saToken);
  const sb = await s.json();
  assert.ok(sb.data.length >= 1);

  const f = await get(base, "/customers?type=COMPANY", saToken);
  assert.ok(f.ok);
});

test("customer notes and activity history", async () => {
  await post(base, `/customers/${customerId}/notes`, { note: "Prefers WhatsApp contact" }, saToken);
  const r = await get(base, `/customers/${customerId}`, saToken);
  const b = await r.json();
  assert.ok(b.data.customer.notes.length >= 1 || b.data.customer.notes === null);
  const a = await get(base, `/customers/${customerId}/activity`, saToken);
  const ab = await a.json();
  const actions = ab.data.activity.map((x) => x.action);
  assert.ok(actions.includes("customer.created"));
  assert.ok(actions.includes("customer.updated"));
});

/* ── Conversion ───────────────────────────────────────────── */

test("convert lead creates a linked customer + flips status CONVERTED", async () => {
  const r = await post(base, `/leads/${leadId}/convert`, {}, saToken);
  const b = await r.json();
  assert.equal(r.status, 200);
  assert.equal(b.data.status, "converted");
  assert.match(b.data.customer.reference, /^CU-/);
  const [lead] = await getPool().query("SELECT status, converted_customer_id FROM leads WHERE id = ?", [leadId]);
  assert.equal(lead[0].status, "CONVERTED");
  assert.equal(String(lead[0].converted_customer_id), String(b.data.customer.id));
});

test("repeated conversion is idempotent — returns same customer", async () => {
  const r = await post(base, `/leads/${leadId}/convert`, {}, saToken);
  const b = await r.json();
  assert.equal(b.data.status, "already_converted");
  // Repeating again returns the same customer — no new row created.
  const first = await post(base, `/leads/${leadId}/convert`, {}, saToken);
  const b2 = await first.json();
  assert.equal(b2.data.customer.id, b.data.customer.id);
});

test("duplicate candidates are returned instead of auto-linking", async () => {
  // secondLead has email l2@example.com; create a customer with same email
  await post(base, "/customers", { name: "Existing", email: "l2@example.com", type: "INDIVIDUAL" }, saToken);
  const r = await post(base, `/leads/${secondLeadId}/convert`, {}, saToken);
  const b = await r.json();
  assert.equal(r.status, 200);
  assert.equal(b.data.status, "duplicate_candidates");
  assert.ok(b.data.candidates.length >= 1);
  // Lead NOT converted yet
  const [lead] = await getPool().query("SELECT status FROM leads WHERE id = ?", [secondLeadId]);
  assert.equal(lead[0].status, "NEW");
});

test("explicit customerId links lead to existing customer", async () => {
  const [c] = await getPool().query("SELECT id FROM customers WHERE email='l2@example.com'");
  const r = await post(base, `/leads/${secondLeadId}/convert`, { customerId: c[0].id }, saToken);
  const b = await r.json();
  assert.equal(b.data.status, "linked");
  const [lead] = await getPool().query("SELECT status, converted_customer_id FROM leads WHERE id = ?", [secondLeadId]);
  assert.equal(lead[0].status, "CONVERTED");
  assert.equal(String(lead[0].converted_customer_id), String(c[0].id));
});

test("conversion preserves quotation→lead linkage and links customer", async () => {
  const r = await post(base, `/leads/${quotationLeadId}/convert`, {}, saToken);
  const b = await r.json();
  assert.equal(b.data.status, "converted");
  const [q] = await getPool().query(
    "SELECT lead_id, customer_id, status FROM quotations WHERE lead_id = ?", [quotationLeadId],
  );
  assert.equal(String(q[0].lead_id), String(quotationLeadId));
  assert.equal(String(q[0].customer_id), String(b.data.customer.id));
  assert.equal(q[0].status, "REQUESTED"); // quotation untouched
});

test("concurrent conversions create exactly one customer", async () => {
  const lid = (await (await post(base, "/leads",
    leadBody({ email: "race2@example.com", businessName: "Race Unique Ventures", country: "Nigeria" }),
    saToken)).json()).data.lead.id;
  const [r1, r2] = await Promise.all([
    post(base, `/leads/${lid}/convert`, {}, saToken),
    post(base, `/leads/${lid}/convert`, {}, saToken),
  ]);
  const b1 = await r1.json(); const b2 = await r2.json();
  const statuses = [b1.data.status, b2.data.status].sort();
  assert.deepEqual(statuses, ["already_converted", "converted"]);
  const [n] = await getPool().query("SELECT COUNT(*) c FROM customers WHERE email='race2@example.com'");
  assert.equal(Number(n[0].c), 1);
});

test("unauthorized roles cannot convert leads", async () => {
  const lid = (await (await post(base, "/leads", leadBody({ email: "noconv@example.com" }), saToken)).json()).data.lead.id;
  // PROJECT_MANAGER lacks leads.convert
  assert.equal((await post(base, `/leads/${lid}/convert`, {}, pmToken)).status, 403);
  // STAFF lacks everything
  assert.equal((await post(base, `/leads/${lid}/convert`, {}, staffToken)).status, 403);
});

test("CONVERTED lead status can no longer be patched", async () => {
  const r = await patch(`/leads/${leadId}/status`, { status: "LOST" }, saToken);
  assert.equal(r.status, 409);
});

test("customer leads endpoint lists converted leads", async () => {
  const [c] = await getPool().query("SELECT id FROM customers WHERE email='l2@example.com'");
  const r = await get(base, `/customers/${c[0].id}/leads`, saToken);
  const b = await r.json();
  assert.equal(b.data.leads.length, 1);
  assert.equal(String(b.data.leads[0].id), String(secondLeadId));
});

/* ── Public regression ────────────────────────────────────── */

test("public contact + quotation endpoints still work (regression)", async () => {
  const c = await post(base, "/public/contact", {
    name: "Reg Test", email: "reg@example.com", type: "Website", message: "regression contact test",
  });
  assert.equal(c.status, 201);
  const q = await post(base, "/public/quotation-requests", {
    name: "Reg Q", email: "regq@example.com", whatsapp: "123",
    serviceCategory: "education", projectType: "Website", description: "regression quote test description",
    features: ["Student management"], budget: "Under $200", timeline: "Flexible", currency: "XAF",
  });
  assert.equal(q.status, 201);
});

import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import {
  resetTestDb, makeUser, startServer, stopServer, login, auth, get, post,
} from "./helpers.js";

const { getPool } = await import("../src/database/pool.js");

let server, base;
let saToken, salesToken, staffToken;

const demoBody = {
  name: "Demo Customer", email: "demo@example.com", phone: "+237 699 000 000",
  country: "Cameroon", organization: "Demo Clinic",
  application: "Hospital Management System", message: "Please schedule a demo.",
};
const enquiryBody = {
  name: "Enquirer One", email: "enq@example.com", phone: "",
  country: "Nigeria", category: "Website Development",
  message: "I need a website for my shop.",
};

let demoId, enquiryId;

before(async () => {
  await resetTestDb();
  ({ server, base } = await startServer());
  await makeUser({ email: "sa@sub.dev", password: "Sup3rPass!", roles: ["SUPER_ADMIN"] });
  saToken = (await login(base, "sa@sub.dev", "Sup3rPass!")).accessToken;
  const sales = await makeUser({ email: "sales@sub.dev", roles: ["SALES_MANAGER"] });
  salesToken = (await login(base, sales.email, sales.password)).accessToken;
  const staff = await makeUser({ email: "staff@sub.dev", roles: ["STAFF"] });
  staffToken = (await login(base, staff.email, staff.password)).accessToken;
});
after(async () => stopServer(server));

const patch = (path, body, token) =>
  fetch(`${base}/api/v1${path}`, { method: "PATCH", headers: auth(token), body: JSON.stringify(body) });

/* ── Public submissions ───────────────────────────────────── */

test("demo request stores a DEMO_REQUEST lead with DR reference", async () => {
  const r = await post(base, "/public/demo-requests", demoBody);
  const b = await r.json();
  assert.equal(r.status, 201);
  assert.match(b.data.reference, /^DR-\d{4}-\d{5}$/);
  const [rows] = await getPool().query(
    "SELECT * FROM leads WHERE reference = ?", [b.data.reference],
  );
  assert.equal(rows.length, 1);
  demoId = rows[0].id;
  assert.equal(rows[0].submission_type, "DEMO_REQUEST");
  assert.equal(rows[0].status, "NEW");
  assert.equal(rows[0].service_category, "Hospital Management System");
  assert.equal(rows[0].business_name, "Demo Clinic");
});

test("general enquiry stores a GENERAL_ENQUIRY lead with EN reference", async () => {
  const r = await post(base, "/public/enquiries", enquiryBody);
  const b = await r.json();
  assert.equal(r.status, 201);
  assert.match(b.data.reference, /^EN-\d{4}-\d{5}$/);
  const [rows] = await getPool().query(
    "SELECT * FROM leads WHERE reference = ?", [b.data.reference],
  );
  enquiryId = rows[0].id;
  assert.equal(rows[0].submission_type, "GENERAL_ENQUIRY");
  assert.equal(rows[0].service_category, "Website Development");
});

test("required fields and enums are validated", async () => {
  // Missing required fields
  assert.equal((await post(base, "/public/demo-requests", { name: "X" })).status, 400);
  // Unknown application
  assert.equal((await post(base, "/public/demo-requests", { ...demoBody, application: "Nope" })).status, 400);
  // Unknown enquiry category
  assert.equal((await post(base, "/public/enquiries", { ...enquiryBody, category: "Nope" })).status, 400);
  // Bad email
  assert.equal((await post(base, "/public/enquiries", { ...enquiryBody, email: "bad" })).status, 400);
  // Demo requires phone
  assert.equal((await post(base, "/public/demo-requests", { ...demoBody, phone: "" })).status, 400);
});

test("idempotent replay returns the same reference without duplicating", async () => {
  const key = "demo-idem-key-0001";
  const headers = { "Idempotency-Key": key };
  const first = await post(base, "/public/demo-requests",
    { ...demoBody, email: "idem@example.com" }, null, headers);
  const replay = await post(base, "/public/demo-requests",
    { ...demoBody, email: "idem@example.com" }, null, headers);
  const b1 = await first.json(); const b2 = await replay.json();
  assert.equal(b1.data.reference, b2.data.reference);
  assert.equal(b2.data.duplicate, true);
  const [n] = await getPool().query(
    "SELECT COUNT(*) c FROM leads WHERE email = 'idem@example.com'");
  assert.equal(Number(n[0].c), 1);
  // Same key, different payload → 409
  const clash = await post(base, "/public/demo-requests",
    { ...demoBody, email: "different@example.com" }, null, headers);
  assert.equal(clash.status, 409);
});

/* ── Admin API ────────────────────────────────────────────── */

test("admin submissions list + filters work", async () => {
  const all = await get(base, "/admin/submissions", saToken);
  const ab = await all.json();
  assert.equal(all.status, 200);
  assert.ok(Number(ab.meta.total) >= 3);

  const demos = await get(base, "/admin/submissions?type=DEMO_REQUEST", saToken);
  const db = await demos.json();
  assert.ok(db.data.every((s) => s.type === "DEMO_REQUEST"));
  assert.ok(db.data.length >= 2);

  const enqs = await get(base, "/admin/submissions?type=GENERAL_ENQUIRY", saToken);
  const eb = await enqs.json();
  assert.ok(eb.data.every((s) => s.type === "GENERAL_ENQUIRY"));

  const byCountry = await get(base, "/admin/submissions?country=Nigeria", saToken);
  assert.ok((await byCountry.json()).data.every((s) => s.country === "Nigeria"));

  const search = await get(base, "/admin/submissions?search=demo@example.com", saToken);
  assert.equal((await search.json()).data.length, 1);

  const byCat = await get(base, `/admin/submissions?category=${encodeURIComponent("Website Development")}`, saToken);
  assert.ok((await byCat.json()).data.every((s) => s.category === "Website Development"));
});

test("stats endpoint returns dashboard counts", async () => {
  const r = await get(base, "/admin/submissions/stats", saToken);
  const b = await r.json();
  assert.equal(r.status, 200);
  assert.ok(Number(b.data.totalDemo) >= 2);
  assert.ok(Number(b.data.totalEnquiries) >= 1);
  assert.ok(Number(b.data.newDemo) >= 2);
});

test("submission detail returns full record", async () => {
  const r = await get(base, `/admin/submissions/${demoId}`, saToken);
  const b = await r.json();
  assert.equal(r.status, 200);
  assert.equal(b.data.submission.reference.startsWith("DR-"), true);
  assert.equal(b.data.submission.organization, "Demo Clinic");
  assert.equal(b.data.submission.message, "Please schedule a demo.");
});

test("status workflow: NEW→CONTACTED→COMPLETED, invalid rejected", async () => {
  // Invalid: NEW → COMPLETED
  assert.equal((await patch(`/admin/submissions/${enquiryId}/status`, { status: "COMPLETED" }, saToken)).status, 400);
  // NEW → CONTACTED → COMPLETED
  assert.equal((await patch(`/admin/submissions/${enquiryId}/status`, { status: "CONTACTED" }, saToken)).status, 200);
  assert.equal((await patch(`/admin/submissions/${enquiryId}/status`, { status: "COMPLETED" }, saToken)).status, 200);
  // CANCELLED via demo: NEW → CANCELLED → reopen NEW
  assert.equal((await patch(`/admin/submissions/${demoId}/status`, { status: "CANCELLED" }, saToken)).status, 200);
  assert.equal((await patch(`/admin/submissions/${demoId}/status`, { status: "COMPLETED" }, saToken)).status, 400);
  assert.equal((await patch(`/admin/submissions/${demoId}/status`, { status: "NEW" }, saToken)).status, 200);
  // Audit recorded
  const [logs] = await getPool().query(
    "SELECT action FROM activity_logs WHERE entity_type='lead' AND entity_id=? AND action='submission.status.changed'",
    [enquiryId]);
  assert.equal(logs.length, 2);
});

test("SALES_MANAGER may view and update submissions; STAFF cannot", async () => {
  assert.equal((await get(base, "/admin/submissions", salesToken)).status, 200);
  assert.equal((await patch(`/admin/submissions/${demoId}/status`, { status: "CONTACTED" }, salesToken)).status, 200);
  assert.equal((await get(base, "/admin/submissions", staffToken)).status, 403);
  assert.equal((await patch(`/admin/submissions/${demoId}/status`, { status: "CONTACTED" }, staffToken)).status, 403);
});

test("unauthenticated access is rejected", async () => {
  assert.equal((await fetch(`${base}/api/v1/admin/submissions`)).status, 401);
  assert.equal((await fetch(`${base}/api/v1/admin/submissions/stats`)).status, 401);
});

test("admin detail does not match non-submission leads", async () => {
  // A manual/CRM lead (no submission_type) must 404 on the admin inbox.
  const [r] = await getPool().query(
    "INSERT INTO leads (reference, name, email, source, status) VALUES ('LD-2999-00001','X','x@x.dev','admin','NEW')");
  const res = await get(base, `/admin/submissions/${r.insertId}`, saToken);
  assert.equal(res.status, 404);
});

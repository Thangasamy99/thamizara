import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import {
  resetTestDb, startServer, stopServer, post,
} from "./helpers.js";

const { getPool } = await import("../src/database/pool.js");
const { __setSender } = await import("../src/services/mailer.js");
const { deliverPending } = await import("../src/services/notifications.js");

let server, base;
before(async () => {
  await resetTestDb();
  ({ server, base } = await startServer());
});
after(async () => {
  __setSender(null);
  await stopServer(server);
});

const uuid = () => crypto.randomUUID();
const contactBody = (over = {}) => ({
  name: "Amina Ngu",
  email: "amina@example.com",
  type: "Business / POS software",
  message: "I need a point-of-sale system for my supermarket in Douala.",
  ...over,
});
const quoteBody = (over = {}) => ({
  name: "Amina Ngu",
  business: "Ngu Mart",
  email: "amina@example.com",
  whatsapp: "+237600000000",
  country: "Cameroon",
  city: "Douala",
  serviceCategory: "small-business",
  serviceLevel: "starter",
  projectType: "Management system",
  description: "POS + inventory for a supermarket with two branches.",
  features: ["POS", "Inventory", "Reports"],
  existingSoftware: "Excel sheets",
  approach: "New application from scratch",
  budget: "100,000 – 300,000 FCFA",
  timeline: "Within one month",
  currency: "XAF",
  ...over,
});

/* ── Contact ──────────────────────────────────────────────── */

test("valid contact request stores a NEW lead with a reference", async () => {
  const r = await post(base, "/public/contact", contactBody());
  const b = await r.json();
  assert.equal(r.status, 201);
  assert.match(b.data.reference, /^LD-\d{4}-\d{5}$/);
  const [rows] = await getPool().query(
    "SELECT source, status, project_type FROM leads WHERE reference = ?", [b.data.reference],
  );
  assert.equal(rows[0].source, "contact_form");
  assert.equal(rows[0].status, "NEW");
  assert.equal(rows[0].project_type, "Business / POS software");
});

test("invalid email / missing fields / overlong input are rejected", async () => {
  const r1 = await post(base, "/public/contact", contactBody({ email: "nope" }));
  assert.equal(r1.status, 400);
  const r2 = await post(base, "/public/contact", contactBody({ name: "", message: "" }));
  assert.equal(r2.status, 400);
  const r3 = await post(base, "/public/contact", contactBody({ message: "x".repeat(4000) }));
  assert.equal(r3.status, 400);
  const [n] = await getPool().query("SELECT COUNT(*) c FROM leads");
  assert.ok(Number(n[0].c) >= 1); // only the first valid request stored
});

test("honeypot field rejects bot submissions", async () => {
  const r = await post(base, "/public/contact", contactBody({ website: "http://spam.bot" }));
  assert.equal(r.status, 400);
});

test("idempotent repeat returns the same response without duplicating", async () => {
  const key = uuid();
  const h = { "Idempotency-Key": key };
  const b = contactBody({ email: "dup@example.com" });
  const r1 = await post(base, "/public/contact", b, undefined, h);
  const r2 = await post(base, "/public/contact", b, undefined, h);
  const [b1, b2] = await Promise.all([r1.json(), r2.json()]);
  assert.equal(r1.status, 201);
  assert.equal(r2.status, 201);
  assert.equal(b1.data.reference, b2.data.reference);
  const [rows] = await getPool().query("SELECT COUNT(*) c FROM leads WHERE email = ?", ["dup@example.com"]);
  assert.equal(Number(rows[0].c), 1);
});

test("same key with a different payload is rejected with 409", async () => {
  const key = uuid();
  await post(base, "/public/contact", contactBody({ email: "k@example.com" }), undefined, { "Idempotency-Key": key });
  const r = await post(base, "/public/contact", contactBody({ email: "other@example.com" }), undefined, { "Idempotency-Key": key });
  assert.equal(r.status, 409);
});

test("malformed Idempotency-Key is rejected", async () => {
  const r = await post(base, "/public/contact", contactBody(), undefined, { "Idempotency-Key": "short" });
  assert.equal(r.status, 400);
});

test("concurrent identical submissions create exactly one lead", async () => {
  const key = uuid();
  const b = contactBody({ email: "race@example.com" });
  const [r1, r2] = await Promise.all([
    post(base, "/public/contact", b, undefined, { "Idempotency-Key": key }),
    post(base, "/public/contact", b, undefined, { "Idempotency-Key": key }),
  ]);
  const codes = [r1.status, r2.status].sort();
  assert.deepEqual(codes, [201, 201]); // one executes, one replays
  const [rows] = await getPool().query("SELECT COUNT(*) c FROM leads WHERE email = ?", ["race@example.com"]);
  assert.equal(Number(rows[0].c), 1);
});

test("public rate limiter returns the JSON 429 envelope", async () => {
  const express = (await import("express")).default;
  const { makeLimiter } = await import("../src/middleware/rateLimit.js");
  const mini = express();
  mini.use(makeLimiter(2, "Too many submissions. Please wait a moment before trying again."));
  mini.get("/x", (_req, res) => res.json({ ok: 1 }));
  const srv = mini.listen(0);
  const port = srv.address().port;
  try {
    const codes = [];
    for (let i = 0; i < 3; i++) {
      codes.push((await fetch(`http://127.0.0.1:${port}/x`)).status);
    }
    assert.deepEqual(codes, [200, 200, 429]);
    const b = await (await fetch(`http://127.0.0.1:${port}/x`)).json();
    assert.equal(b.success, false);
    assert.match(b.message, /too many/i);
  } finally {
    srv.close();
  }
});

/* ── Quotation requests ───────────────────────────────────── */

test("valid quotation request creates linked lead + REQUESTED quotation", async () => {
  const r = await post(base, "/public/quotation-requests", quoteBody());
  const b = await r.json();
  assert.equal(r.status, 201);
  assert.match(b.data.reference, /^QT-\d{4}-\d{5}$/);
  assert.ok(b.data.statusToken.length > 20);
  const [q] = await getPool().query(
    `SELECT q.lead_id, q.status, q.currency, q.budget_range, q.public_token, l.source
       FROM quotations q JOIN leads l ON l.id = q.lead_id
      WHERE q.quote_number = ?`, [b.data.reference],
  );
  assert.equal(q[0].status, "REQUESTED");
  assert.equal(q[0].currency, "XAF");
  assert.equal(q[0].budget_range, "100,000 – 300,000 FCFA");
  assert.equal(q[0].source, "quotation_wizard");
  // Only the HASH of the status token is stored.
  assert.notEqual(q[0].public_token, b.data.statusToken);
  assert.equal(q[0].public_token.length, 64);
});

test("invalid currency / missing fields / bad category are rejected", async () => {
  const r1 = await post(base, "/public/quotation-requests", quoteBody({ currency: "EUR" }));
  assert.equal(r1.status, 400);
  const r2 = await post(base, "/public/quotation-requests", quoteBody({ description: "", features: [] }));
  assert.equal(r2.status, 400);
  const r3 = await post(base, "/public/quotation-requests", quoteBody({ serviceCategory: "made-up" }));
  assert.equal(r3.status, 400);
});

test("quotation idempotent repeat + different-payload 409", async () => {
  const key = uuid();
  const h = { "Idempotency-Key": key };
  const r1 = await post(base, "/public/quotation-requests", quoteBody({ email: "qd@example.com" }), undefined, h);
  const r2 = await post(base, "/public/quotation-requests", quoteBody({ email: "qd@example.com" }), undefined, h);
  const b1 = await r1.json();
  const b2 = await r2.json();
  assert.equal(b1.data.reference, b2.data.reference);
  assert.equal(b1.data.statusToken, b2.data.statusToken);
  const [rows] = await getPool().query("SELECT COUNT(*) c FROM quotations WHERE lead_id IN (SELECT id FROM leads WHERE email='qd@example.com')");
  assert.equal(Number(rows[0].c), 1);

  const r3 = await post(base, "/public/quotation-requests", quoteBody({ email: "qd@example.com", currency: "USD" }), undefined, h);
  assert.equal(r3.status, 409);
});

test("a mid-transaction failure rolls everything back", async () => {
  // Seed a lead holding a specific idempotency key, then submit with the same
  // key: the leads unique index makes the work INSERT fail inside the
  // transaction — the in_progress idempotency row must roll back too.
  const key = "rollback-test-key-0001";
  const before = {
    leads: (await getPool().query("SELECT COUNT(*) c FROM leads"))[0][0].c,
    idem: (await getPool().query("SELECT COUNT(*) c FROM idempotency_keys"))[0][0].c,
  };
  await getPool().query(
    `INSERT INTO leads (reference, name, email, source, status, idempotency_key)
     VALUES ('LD-TEST-DUP', 'Dup', 'dup-lead@example.com', 'admin', 'NEW', ?)`,
    [key],
  );
  const r = await post(base, "/public/contact", contactBody({ email: "atomic@example.com" }),
    undefined, { "Idempotency-Key": key });
  assert.equal(r.status, 500);
  assert.equal(Number((await getPool().query("SELECT COUNT(*) c FROM leads WHERE email='atomic@example.com'"))[0][0].c), 0);
  assert.equal(Number((await getPool().query("SELECT COUNT(*) c FROM idempotency_keys"))[0][0].c), Number(before.idem));
});

/* ── Status lookup ────────────────────────────────────────── */

test("status lookup returns customer-safe data for a valid token", async () => {
  const r = await post(base, "/public/quotation-requests", quoteBody({ email: "status@example.com" }));
  const { statusToken, reference } = (await r.json()).data;
  const s = await fetch(`${base}/api/v1/public/quotation-status/${statusToken}`);
  const sb = await s.json();
  assert.equal(s.status, 200);
  assert.equal(sb.data.reference, reference);
  assert.equal(sb.data.status, "REQUESTED");
  assert.equal(sb.data.currency, "XAF");
  // No internal leakage:
  assert.equal(sb.data.id, undefined);
  assert.equal(sb.data.lead_id, undefined);
  assert.equal(sb.data.total, undefined); // hidden until SENT
  assert.equal(sb.data.public_token, undefined);
});

test("invalid and malformed tokens get a safe 404", async () => {
  const r1 = await fetch(`${base}/api/v1/public/quotation-status/not-a-real-token-value-12345`);
  assert.equal(r1.status, 404);
  const r2 = await fetch(`${base}/api/v1/public/quotation-status/short`);
  assert.equal(r2.status, 404);
});

/* ── Notifications ────────────────────────────────────────── */

test("successful delivery marks notification sent; failures are recorded, never fatal", async () => {
  const sent = [];
  __setSender(async (m) => { sent.push(m); return true; });

  const r = await post(base, "/public/contact", contactBody({ email: "mail@example.com" }));
  assert.equal(r.status, 201);
  await deliverPending();
  assert.ok(sent.some((m) => m.to === "mail@example.com"));
  const [n] = await getPool().query(
    "SELECT status FROM notifications WHERE recipient = 'mail@example.com'",
  );
  assert.equal(n[0].status, "sent");

  // Now simulate SMTP failure.
  __setSender(async () => false);
  const r2 = await post(base, "/public/contact", contactBody({ email: "fail@example.com" }));
  assert.equal(r2.status, 201); // enquiry still stored
  await deliverPending();
  const [f] = await getPool().query(
    "SELECT status, attempts FROM notifications WHERE recipient = 'fail@example.com'",
  );
  assert.equal(f[0].status, "pending"); // still retryable, not failed yet
  assert.equal(f[0].attempts, 1);
  const [a] = await getPool().query(
    "SELECT COUNT(*) c FROM notification_attempts na JOIN notifications n ON n.id = na.notification_id WHERE n.recipient = 'fail@example.com'",
  );
  assert.equal(Number(a[0].c), 1);

  // Retry succeeds on the next pass.
  __setSender(async () => true);
  await deliverPending();
  const [f2] = await getPool().query("SELECT status FROM notifications WHERE recipient = 'fail@example.com'");
  assert.equal(f2[0].status, "sent");
});

test("replayed idempotent request does not resend emails", async () => {
  const sent = [];
  __setSender(async (m) => { sent.push(m); return true; });
  const key = uuid();
  const h = { "Idempotency-Key": key };
  await post(base, "/public/contact", contactBody({ email: "once@example.com" }), undefined, h);
  await deliverPending();
  const count1 = sent.filter((m) => m.to === "once@example.com").length;
  await post(base, "/public/contact", contactBody({ email: "once@example.com" }), undefined, h);
  await deliverPending();
  const count2 = sent.filter((m) => m.to === "once@example.com").length;
  assert.equal(count1, count2); // no duplicate confirmation
});

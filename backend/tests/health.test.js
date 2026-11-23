import { test, before, after } from "node:test";
import assert from "node:assert/strict";

process.env.NODE_ENV = "test";
const { default: app } = await import("../src/app.js");

const { closePool } = await import("../src/database/pool.js");

let server, base;
before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      base = `http://127.0.0.1:${server.address().port}`;
      resolve();
    });
  });
});
after(async () => {
  server.close();
  await closePool();
});

test("GET /health returns the success envelope with db status", async () => {
  const res = await fetch(`${base}/health`);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.success, true);
  assert.equal(body.data.status, "ok");
  assert.ok(["up", "down"].includes(body.data.db));
});

test("GET /api/v1/health responds through the versioned router", async () => {
  const res = await fetch(`${base}/api/v1/health`);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.success, true);
});

test("unknown routes return a JSON 404 envelope", async () => {
  const res = await fetch(`${base}/api/v1/does-not-exist`);
  assert.equal(res.status, 404);
  const body = await res.json();
  assert.equal(body.success, false);
  assert.match(body.message, /not found/i);
});

test("CORS rejects origins outside the allowlist", async () => {
  const res = await fetch(`${base}/health`, {
    headers: { Origin: "https://evil.example.com" },
  });
  // cors middleware calls next(err) → 500 via error handler, or blocks origin
  assert.notEqual(res.headers.get("access-control-allow-origin"), "https://evil.example.com");
});

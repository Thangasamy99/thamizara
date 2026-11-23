import puppeteer from "puppeteer-core";

const BASE = "http://localhost:5173";
const API = "http://localhost:4000/api/v1";
const browser = await puppeteer.launch({
  executablePath: "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  headless: "new",
  args: ["--no-sandbox", "--disable-gpu"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
const results = [];
const check = (name, ok, extra = "") =>
  results.push(`${ok ? "PASS" : "FAIL"} ${name}${extra ? " — " + extra : ""}`);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const type = async (sel, v) => page.type(sel, v);
const clickText = async (text, scope = "button") =>
  page.evaluate((t, s) => {
    const el = [...document.querySelectorAll(s)].find((b) => b.textContent.trim().includes(t));
    el?.click();
    return Boolean(el);
  }, text, scope);

/* ── Contact form → API ──────────────────────────────────── */
await page.goto(`${BASE}/contact`, { waitUntil: "networkidle0" });
await sleep(600);
await type("#name", "QA Contact");
await type("#email", "qa-contact@example.com");
await type("#message", "Browser-automation test: we need a school portal for our college.");
await page.click('button[type="submit"]');
await sleep(1800);
const contactOk = await page.evaluate(() => document.body.innerText.match(/reference\s*(LD-\d{4}-\d{5})/));
check("contact form submits to API and shows reference", Boolean(contactOk), contactOk?.[1] ?? "no reference");
await page.screenshot({ path: "scripts/shots/p43-contact.png", fullPage: true });

// Lead actually stored in the API DB — verify via a second idempotent read is not public;
// instead confirm the reference pattern was real (LD-…) — DB verified in backend tests.

/* ── Quotation wizard → API ──────────────────────────────── */
await page.goto(`${BASE}/request-quotation`, { waitUntil: "networkidle0" });
await sleep(600);

// Step 1
await type('[name="name"]', "QA Buyer");
await type('[name="business"]', "QA Mart Ltd");
await type('[name="email"]', "qa-buyer@example.com");
await type('[name="whatsapp"]', "+237699112233");
await page.select('[name="country"]', "Cameroon");
await type('[name="city"]', "Douala");
await clickText("Next");
await sleep(500);

// Step 2
await page.select('[name="serviceCategory"]', "healthcare");
await page.select('[name="projectType"]', "Management system");
await type('textarea#description', "Clinic management: patients, billing and pharmacy for a small clinic.");
await clickText("Billing", "button[aria-pressed]");
await sleep(200);
await clickText("Next");
await sleep(500);

// Step 3 — currency NGN + budget pill + timeline
await clickText("NGN", "button");
await sleep(200);
const budgetClicked = await page.evaluate(() => {
  const b = [...document.querySelectorAll("button")].find((x) => x.textContent.includes("₦"));
  b?.click(); return Boolean(b);
});
check("budget pill selected", budgetClicked);
await sleep(200);
await clickText("Within three months", "button");
await sleep(200);
await clickText("Next");
await sleep(600);

// Step 4 — review then submit
const reviewVisible = await page.evaluate(() => document.body.innerText.includes("Review"));
check("review step shown", reviewVisible);
await page.screenshot({ path: "scripts/shots/p43-review.png" });
await clickText("Submit Enquiry");
await sleep(2200);

const confirm = await page.evaluate(() => {
  const t = document.body.innerText;
  const ref = t.match(/QT-\d{4}-\d{5}/)?.[0];
  return { received: t.includes("Quotation Request Received"), ref, hasToken: /tracking code/i.test(t) };
});
check("confirmation shows 'Quotation Request Received'", confirm.received);
check("confirmation shows reference number", Boolean(confirm.ref), confirm.ref ?? "none");
check("confirmation shows tracking code", confirm.hasToken);
await page.screenshot({ path: "scripts/shots/p43-confirmation.png", fullPage: true });

/* ── Status lookup via API with the shown token ───────────── */
const token = await page.evaluate(() =>
  [...document.querySelectorAll("p")].map((p) => p.textContent.trim())
    .find((t) => /^[A-Za-z0-9_-]{30,}$/.test(t)),
);
const status = await fetch(`${API}/public/quotation-status/${token}`).then((r) => r.json());
check("status token resolves via public lookup", status.success === true && status.data?.status === "REQUESTED", JSON.stringify(status.data ?? status.message));

/* ── Contact failure path ─────────────────────────────────── */
// Block the API route to simulate failure → form must show error + keep data.
await page.setRequestInterception(true);
page.on("request", (req) => {
  if (req.url().includes("/api/v1/public/")) req.abort();
  else req.continue();
});
await page.goto(`${BASE}/contact`, { waitUntil: "networkidle0" });
await type("#name", "Failure Test");
await type("#email", "fail@example.com");
await type("#message", "This should fail because the API is unreachable.");
await page.click('button[type="submit"]');
await sleep(1800);
const failState = await page.evaluate(() => ({
  error: /wrong|failed|try again/i.test(document.body.innerText),
  nameKept: document.querySelector("#name")?.value === "Failure Test",
}));
check("API failure shows error and preserves form data", failState.error && failState.nameKept, JSON.stringify(failState));
await page.screenshot({ path: "scripts/shots/p43-contact-fail.png" });

await browser.close();
console.log("\n" + results.join("\n"));
console.log(results.every((r) => r.startsWith("PASS")) ? "\nALL PASS" : "\nSOME FAILURES");
process.exit(results.every((r) => r.startsWith("PASS")) ? 0 : 1);

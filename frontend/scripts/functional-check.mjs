import puppeteer from "puppeteer-core";

const BASE = "http://localhost:5173";
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

// --- Portfolio page + filters ---
await page.goto(`${BASE}/portfolio`, { waitUntil: "networkidle0" });
await new Promise((r) => setTimeout(r, 800));
const cardCount = async () =>
  page.evaluate(() => document.querySelectorAll("article").length);
check("portfolio shows 8 projects", (await cardCount()) === 8, `${await cardCount()} cards`);

for (const [label, expected] of [
  ["Healthcare", 2],
  ["Education", 1],
  ["Community", 1],
  ["All Projects", 8],
]) {
  await page.evaluate((l) => {
    [...document.querySelectorAll('button[role="tab"]')]
      .find((b) => b.textContent.trim() === l)?.click();
  }, label);
  await new Promise((r) => setTimeout(r, 700));
  check(`filter "${label}"`, (await cardCount()) === expected, `${await cardCount()} cards`);
}
await page.screenshot({ path: "scripts/shots/p2-portfolio.png", fullPage: true });

// --- Detail page ---
await page.goto(`${BASE}/portfolio/hospital-management`, { waitUntil: "networkidle0" });
await new Promise((r) => setTimeout(r, 800));
const h1 = await page.evaluate(() => document.querySelector("h1")?.textContent);
check("detail page title", h1 === "Hospital Management System", h1);
check(
  "gallery has 3 screens",
  (await page.evaluate(() => document.querySelectorAll("#screens button").length)) === 3,
);
check(
  "related projects shown",
  (await page.evaluate(() => document.querySelectorAll("article").length)) === 3,
);
await page.screenshot({ path: "scripts/shots/p2-detail.png", fullPage: true });

// --- Lightbox ---
await page.evaluate(() => {
  [...document.querySelectorAll("#screens button")][0]?.click();
});
await new Promise((r) => setTimeout(r, 500));
const lightboxOpen = await page.evaluate(() => !!document.querySelector('[role="dialog"]'));
check("gallery lightbox opens", lightboxOpen);
await page.keyboard.press("Escape");
await new Promise((r) => setTimeout(r, 400));
check(
  "lightbox closes on Escape",
  (await page.evaluate(() => !!document.querySelector('[role="dialog"]'))) === false,
);

// --- Enquiry modal ---
await page.evaluate(() => {
  [...document.querySelectorAll("button")]
    .find((b) => b.textContent.includes("Request a Similar"))?.click();
});
await new Promise((r) => setTimeout(r, 600));
const modal = await page.evaluate(() => {
  const dlg = document.querySelector('[role="dialog"]');
  if (!dlg) return null;
  const sel = dlg.querySelector("#enq-projectType");
  return { open: true, projectType: sel?.value };
});
check("enquiry modal opens", modal?.open === true);
check("project type preselected", modal?.projectType === "Hospital Management System", modal?.projectType);
await page.screenshot({ path: "scripts/shots/p2-enquiry.png" });

// --- Validation: submit empty shows errors ---
await page.evaluate(() => {
  [...document.querySelectorAll('[role="dialog"] button')]
    .find((b) => b.textContent.includes("Send Enquiry"))?.click();
});
await new Promise((r) => setTimeout(r, 400));
const errCount = await page.evaluate(
  () => document.querySelectorAll('[role="dialog"] .text-red-500').length,
);
check("form validation blocks empty submit", errCount >= 3, `${errCount} errors`);

// --- Unknown slug redirects ---
await page.goto(`${BASE}/portfolio/nonexistent`, { waitUntil: "networkidle0" });
await new Promise((r) => setTimeout(r, 600));
check(
  "unknown slug redirects to /portfolio",
  page.url() === `${BASE}/portfolio`,
  page.url(),
);

await browser.close();
results.forEach((r) => console.log(r));
const failed = results.filter((r) => r.startsWith("FAIL"));
console.log(failed.length ? `\n${failed.length} FAILED` : "\nAll functional checks passed");
process.exit(failed.length ? 1 : 0);

import puppeteer from "puppeteer-core";

const BASE = "http://localhost:5173";
const browser = await puppeteer.launch({
  executablePath: "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  headless: "new",
  args: ["--no-sandbox", "--disable-gpu"],
});

const page = await browser.newPage();
await page.setViewport({ width: 375, height: 812, deviceScaleFactor: 2 });
await page.goto(`${BASE}/`, { waitUntil: "networkidle0" });
await new Promise((r) => setTimeout(r, 800));
await page.screenshot({ path: "scripts/shots/m-hero.png" });

await page.evaluate(() => window.scrollBy(0, 900));
await new Promise((r) => setTimeout(r, 500));
await page.screenshot({ path: "scripts/shots/m-cats.png" });

// mobile menu
await page.evaluate(() => window.scrollTo(0, 0));
await page.click('button[aria-label="Open menu"]');
await new Promise((r) => setTimeout(r, 500));
await page.screenshot({ path: "scripts/shots/m-menu.png" });

await browser.close();
console.log("done");

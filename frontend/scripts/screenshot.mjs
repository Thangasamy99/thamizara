import puppeteer from "puppeteer-core";

const BASE = process.env.BASE_URL || "http://localhost:5173";
const shots = [
  { route: "/", width: 1440, name: "home-desktop", full: true },
  { route: "/", width: 375, name: "home-mobile", full: true },
  { route: "/work", width: 1440, name: "work-desktop", full: true },
  { route: "/services", width: 1440, name: "services-desktop", full: true },
];

const browser = await puppeteer.launch({
  executablePath: "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  headless: "new",
  args: ["--no-sandbox", "--disable-gpu"],
});

const page = await browser.newPage();
for (const { route, width, name, full } of shots) {
  await page.setViewport({ width, height: 900, deviceScaleFactor: 1 });
  await page.goto(`${BASE}${route}`, { waitUntil: "networkidle0", timeout: 30000 });
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await new Promise((r) => setTimeout(r, 600));
  await page.evaluate(() => window.scrollTo(0, 0));
  await new Promise((r) => setTimeout(r, 300));
  await page.screenshot({ path: `scripts/shots/${name}.png`, fullPage: full });
  console.log(`saved ${name}.png`);
}
await browser.close();

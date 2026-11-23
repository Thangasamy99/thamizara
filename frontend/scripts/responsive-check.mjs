import puppeteer from "puppeteer-core";

const WIDTHS = [320, 360, 375, 390, 430, 768, 1024, 1280, 1440, 1920];
const ROUTES = [
  "/",
  "/services",
  "/services/small-business",
  "/services/student-projects",
  "/services/education",
  "/services/healthcare",
  "/services/property-hospitality",
  "/services/custom-software",
  "/pricing",
  "/request-quotation",
  "/portfolio",
  "/portfolio/hospital-management",
  "/portfolio/eye-hospital-management",
  "/portfolio/school-management",
  "/portfolio/property-management",
  "/portfolio/ecommerce",
  "/portfolio/church-management",
  "/portfolio/hotel-management",
  "/portfolio/hostel-management",
  "/about",
  "/contact",
];
const BASE = process.env.BASE_URL || "http://localhost:5173";

const browser = await puppeteer.launch({
  executablePath: "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  headless: "new",
  args: ["--no-sandbox", "--disable-gpu"],
});

const issues = [];

for (const route of ROUTES) {
  const page = await browser.newPage();
  for (const width of WIDTHS) {
    await page.setViewport({ width, height: 900, deviceScaleFactor: 1 });
    await page.goto(`${BASE}${route}`, { waitUntil: "networkidle0", timeout: 30000 });
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await new Promise((r) => setTimeout(r, 400));
    await page.evaluate(() => window.scrollTo(0, 0));
    await new Promise((r) => setTimeout(r, 200));

    const result = await page.evaluate(() => {
      const docW = document.documentElement.clientWidth;
      const overflowing = [];
      document.querySelectorAll("*").forEach((el) => {
        const r = el.getBoundingClientRect();
        // Elements clipped by an overflow-hidden ancestor cannot cause page overflow.
        let clipped = false;
        for (let p = el.parentElement; p; p = p.parentElement) {
          const o = getComputedStyle(p).overflowX;
          if (o === "hidden" || o === "clip" || o === "scroll" || o === "auto") {
            clipped = true;
            break;
          }
        }
        if (!clipped && r.width > 0 && (r.right > docW + 1 || r.left < -1) && el.offsetParent !== null) {
          const tag = el.tagName.toLowerCase();
          const cls = (el.className?.baseVal ?? el.className ?? "").toString().slice(0, 80);
          overflowing.push(`${tag}.${cls} [L:${Math.round(r.left)} R:${Math.round(r.right)}]`);
        }
      });
      return {
        scrollW: document.documentElement.scrollWidth,
        clientW: docW,
        hOverflow: document.documentElement.scrollWidth > docW + 1,
        overflowing: overflowing.slice(0, 5),
      };
    });

    if (result.hOverflow || result.overflowing.length) {
      issues.push({ route, width, ...result });
      console.log(`FAIL ${route} @${width}px — scrollW:${result.scrollW} clientW:${result.clientW}`);
      result.overflowing.forEach((o) => console.log(`   ↳ ${o}`));
    } else {
      console.log(`ok   ${route} @${width}px`);
    }
  }
  await page.close();
}

await browser.close();
console.log(issues.length ? `\n${issues.length} issue(s) found` : "\nAll checks passed");
process.exit(issues.length ? 1 : 0);

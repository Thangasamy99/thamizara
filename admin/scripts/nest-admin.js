// Post-build: mirrors index.html + assets into dist/admin so the static
// files resolve whether Vercel forwards the full path (/admin/assets/x)
// or a stripped path (/assets/x) to the admin service.
import { cpSync, mkdirSync } from "node:fs";

mkdirSync("dist/admin", { recursive: true });
cpSync("dist/index.html", "dist/admin/index.html");
cpSync("dist/assets", "dist/admin/assets", { recursive: true });
console.log("dist/admin mirror created for the /admin path prefix");

// Local MySQL backup → backups/thamizora-YYYY-MM-DD.sql (schema + data).
import mysql from "mysql2/promise";
import fs from "node:fs";
import "dotenv/config";

const esc = (v) =>
  v === null || v === undefined
    ? "NULL"
    : typeof v === "number" || typeof v === "bigint"
      ? String(v)
      : mysql.escape(String(v));

const conn = await mysql.createConnection({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  dateStrings: true,
});

const [tables] = await conn.query("SHOW TABLES");
const key = Object.keys(tables[0])[0];
let out = `-- thamizora backup ${new Date().toISOString()}\nSET FOREIGN_KEY_CHECKS=0;\n`;

for (const t of tables.map((r) => r[key])) {
  const [[ct]] = await conn.query(`SHOW CREATE TABLE \`${t}\``);
  out += `\nDROP TABLE IF EXISTS \`${t}\`;\n${ct["Create Table"]};\n`;
  const [rows] = await conn.query(`SELECT * FROM \`${t}\``);
  if (rows.length) {
    const cols = Object.keys(rows[0]);
    for (const r of rows)
      out += `INSERT INTO \`${t}\` (\`${cols.join("`,`")}\`) VALUES (${cols.map((c) => esc(r[c])).join(",")});\n`;
  }
}
out += "\nSET FOREIGN_KEY_CHECKS=1;\n";

fs.mkdirSync("backups", { recursive: true });
const f = `backups/thamizora-${new Date().toISOString().slice(0, 10)}.sql`;
fs.writeFileSync(f, out);
console.log(`backup: ${f} | tables: ${tables.length} | size: ${Math.round(out.length / 1024)}KB`);
await conn.end();

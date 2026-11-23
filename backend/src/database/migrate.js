#!/usr/bin/env node
/**
 * Migration runner.
 *
 *   node src/database/migrate.js up      → apply all pending *.up.sql
 *   node src/database/migrate.js down    → roll back the most recent batch
 *   node src/database/migrate.js status  → list applied / pending migrations
 *
 * Migrations live in ../../migrations as NNN_name.up.sql / NNN_name.down.sql
 * and are tracked in the schema_migrations table. Each runs inside a
 * transaction. The database itself is created if missing.
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mysql from "mysql2/promise";
import env from "../config/env.js";

const MIGRATIONS_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../migrations",
);

const connect = (database) =>
  mysql.createConnection({
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database,
    multipleStatements: true,
  });

async function listFiles() {
  const files = (await fs.readdir(MIGRATIONS_DIR)).filter((f) => f.endsWith(".up.sql")).sort();
  return files.map((f) => ({
    version: f.split("_")[0],
    name: f,
    up: path.join(MIGRATIONS_DIR, f),
    down: path.join(MIGRATIONS_DIR, f.replace(".up.sql", ".down.sql")),
  }));
}

async function ensureDatabase() {
  const conn = await connect(undefined);
  await conn.query(
    `CREATE DATABASE IF NOT EXISTS \`${env.DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
  );
  await conn.end();
}

async function ensureTable(conn) {
  await conn.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version VARCHAR(32) NOT NULL,
      name VARCHAR(255) NOT NULL,
      batch INT NOT NULL,
      applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (version)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
}

const applied = async (conn) =>
  (await conn.query("SELECT version, name, batch FROM schema_migrations ORDER BY version"))[0];

async function up() {
  await ensureDatabase();
  const conn = await connect(env.DB_NAME);
  try {
    await ensureTable(conn);
    const done = new Set((await applied(conn)).map((r) => r.version));
    const pending = (await listFiles()).filter((m) => !done.has(m.version));
    if (!pending.length) return console.log("Nothing to migrate — schema is up to date.");

    const batch = Math.max(0, ...(await applied(conn)).map((r) => r.batch)) + 1;
    for (const m of pending) {
      const sql = await fs.readFile(m.up, "utf8");
      await conn.beginTransaction();
      try {
        await conn.query(sql);
        await conn.query("INSERT INTO schema_migrations (version, name, batch) VALUES (?, ?, ?)", [
          m.version, m.name, batch,
        ]);
        await conn.commit();
        console.log(`  ✓ ${m.name} (batch ${batch})`);
      } catch (err) {
        await conn.rollback();
        throw new Error(`Migration ${m.name} failed: ${err.message}`);
      }
    }
    console.log(`Applied ${pending.length} migration(s).`);
  } finally {
    await conn.end();
  }
}

async function down() {
  const conn = await connect(env.DB_NAME);
  try {
    await ensureTable(conn);
    const rows = await applied(conn);
    if (!rows.length) return console.log("No migrations applied.");
    const lastBatch = rows[rows.length - 1].batch;
    const files = await listFiles();
    for (const row of rows.filter((r) => r.batch === lastBatch).reverse()) {
      const file = files.find((f) => f.version === row.version);
      if (!file) throw new Error(`Missing migration file for ${row.name}`);
      const sql = await fs.readFile(file.down, "utf8");
      await conn.beginTransaction();
      try {
        await conn.query(sql);
        await conn.query("DELETE FROM schema_migrations WHERE version = ?", [row.version]);
        await conn.commit();
        console.log(`  ✓ rolled back ${row.name}`);
      } catch (err) {
        await conn.rollback();
        throw new Error(`Rollback of ${row.name} failed: ${err.message}`);
      }
    }
    console.log(`Rolled back batch ${lastBatch}.`);
  } finally {
    await conn.end();
  }
}

async function status() {
  const conn = await connect(env.DB_NAME);
  try {
    await ensureTable(conn);
    const done = new Map((await applied(conn)).map((r) => [r.version, r.batch]));
    for (const m of await listFiles()) {
      console.log(`  ${done.has(m.version) ? "[applied]" : "[pending] "} ${m.name}`);
    }
  } finally {
    await conn.end();
  }
}

const cmd = process.argv[2] ?? "up";
try {
  if (cmd === "up") await up();
  else if (cmd === "down") await down();
  else if (cmd === "status") await status();
  else {
    console.error(`Unknown command "${cmd}". Use: up | down | status`);
    process.exitCode = 1;
  }
} catch (err) {
  console.error(`Migration error: ${err.message}`);
  process.exitCode = 1;
}

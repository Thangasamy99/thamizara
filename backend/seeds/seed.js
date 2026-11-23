#!/usr/bin/env node
/**
 * Creates the FIRST SUPER_ADMIN account — CLI-only, no public registration.
 *
 *   npm run seed:admin
 *     → interactive prompts (password typed invisibly)
 *   npm run seed:admin -- --name "X" --email x@y.z --password '...'
 *     → non-interactive (for automation/tests)
 *
 * Refuses to run if a SUPER_ADMIN already exists. Also (re)seeds the
 * roles/permissions matrix idempotently.
 */
import readline from "node:readline";
import bcrypt from "bcryptjs";
import env from "../src/config/env.js";
import { getPool, withTransaction, closePool } from "../src/database/pool.js";
import { seedRbac } from "../src/database/seedRbac.js";

const arg = (name) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : undefined;
};

const ask = (question) =>
  new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(question, (answer) => { rl.close(); resolve(answer.trim()); });
  });

/** Reads a secret without echoing characters. */
const askSecret = (question) =>
  new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.stdoutMuted = true;
    const origWrite = rl._writeToOutput;
    rl._writeToOutput = function (s) {
      rl.output.write(rl.stdoutMuted ? "*" : s);
    };
    rl.question(question, (answer) => {
      rl._writeToOutput = origWrite;
      rl.output.write("\n");
      rl.close();
      resolve(answer.trim());
    });
  });

const validPassword = (p) =>
  p.length >= 8 && p.length <= 128 && /[a-z]/.test(p) && /[A-Z]/.test(p) && /[0-9]/.test(p);

async function main() {
  const pool = getPool();

  const [saRows] = await pool.query(
    `SELECT COUNT(*) AS n FROM users u
       JOIN user_roles ur ON ur.user_id = u.id
       JOIN roles r ON r.id = ur.role_id
      WHERE r.name = 'SUPER_ADMIN' AND u.deleted_at IS NULL`,
  );
  if (saRows[0].n > 0) {
    console.error("A SUPER_ADMIN already exists — refusing to create another.");
    console.error("Create additional users through the admin API instead.");
    process.exitCode = 1;
    return;
  }

  const name = arg("name") ?? (await ask("Name: "));
  const email = arg("email") ?? (await ask("Email: "));
  const password = arg("password") ?? (await askSecret("Password: "));

  if (!name || !email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    console.error("A valid name and email are required.");
    process.exitCode = 1;
    return;
  }
  if (!validPassword(password)) {
    console.error("Password must be 8–128 chars with upper, lower and a digit.");
    process.exitCode = 1;
    return;
  }

  const hash = await bcrypt.hash(password, env.BCRYPT_ROUNDS);
  await withTransaction(async (conn) => {
    await seedRbac(conn);
    const [r] = await conn.query(
      "INSERT INTO users (name, email, password_hash, status) VALUES (?, ?, ?, 'ACTIVE')",
      [name, email.toLowerCase(), hash],
    );
    const [[role]] = await conn.query("SELECT id FROM roles WHERE name = 'SUPER_ADMIN'");
    await conn.query("INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)", [r.insertId, role.id]);
    await conn.query(
      "INSERT INTO activity_logs (actor_id, action, entity_type, entity_id, summary) VALUES (?, 'user.seeded', 'user', ?, ?)",
      [r.insertId, r.insertId, `Initial SUPER_ADMIN seeded (${email})`],
    );
    console.log(`SUPER_ADMIN created: ${email} (id ${r.insertId})`);
  });
}

try {
  await main();
} catch (err) {
  console.error(`Seed failed: ${err.message}`);
  process.exitCode = 1;
} finally {
  await closePool();
}

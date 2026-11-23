import env from "../../config/env.js";
import { getPool, withTransaction } from "../../database/pool.js";
import ApiError from "../../utils/ApiError.js";
import { sha256 } from "../../utils/crypto.js";

const KEY_RE = /^[A-Za-z0-9_-]{16,128}$/;

/**
 * Runs `work(conn)` exactly once per (scope, Idempotency-Key).
 *
 * - First request: inserts an in_progress row inside the work transaction,
 *   then marks it completed with the response.
 * - Repeat with same payload: returns the stored response (no duplicate rows).
 * - Same key + different payload: 409 conflict.
 * - Concurrent duplicate: unique constraint serialises; the loser reads the
 *   completed row and gets the same response.
 *
 * Records expire after IDEMPOTENCY_TTL_HOURS (24 h default) and are pruned
 * opportunistically on each call — retention policy is "one day, then free".
 */
export async function idempotent(scope, key, payload, work) {
  const pool = getPool();
  // No key → still run the work atomically, just without dedup.
  if (!key) return { data: await withTransaction(work), replayed: false };
  if (!KEY_RE.test(key)) {
    throw ApiError.badRequest("Invalid Idempotency-Key header (16–128 URL-safe characters)");
  }

  const keyHash = sha256(`${scope}:${key}`);
  const requestHash = sha256(JSON.stringify(payload));
  const expiresAt = new Date(Date.now() + env.IDEMPOTENCY_TTL_HOURS * 3_600_000);

  // Cheap retention sweep.
  await pool.query("DELETE FROM idempotency_keys WHERE expires_at < NOW() LIMIT 500").catch(() => {});

  try {
    const { response } = await withTransaction(async (conn) => {
      await conn.query(
        `INSERT INTO idempotency_keys (scope, key_hash, request_hash, expires_at)
         VALUES (?, ?, ?, ?)`,
        [scope, keyHash, requestHash, expiresAt],
      );
      const data = await work(conn);
      await conn.query(
        `UPDATE idempotency_keys SET status='completed', response=?, lead_id=? WHERE scope=? AND key_hash=?`,
        [JSON.stringify(data), data.leadId ?? null, scope, keyHash],
      );
      return { response: data };
    });
    return { data: response, replayed: false };
  } catch (err) {
    if (err.code !== "ER_DUP_ENTRY") throw err;
    // Key already exists — replay or reject on payload mismatch.
    const [rows] = await pool.query(
      "SELECT request_hash, status, response FROM idempotency_keys WHERE scope=? AND key_hash=?",
      [scope, keyHash],
    );
    const existing = rows[0];
    if (!existing) throw err;
    if (existing.request_hash !== requestHash) {
      throw ApiError.conflict("Idempotency-Key was already used with a different request");
    }
    if (existing.status === "in_progress") {
      throw ApiError.conflict("This submission is still being processed — please wait a moment and retry");
    }
    return { data: existing.response, replayed: true };
  }
}

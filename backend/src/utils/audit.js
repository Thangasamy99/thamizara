import { getPool } from "../database/pool.js";
import logger from "./logger.js";

/**
 * Writes an immutable activity-log entry. Never throws — audit failures are
 * logged but must not break the business operation.
 * IMPORTANT: never pass secrets (passwords, tokens) in `summary`.
 */
export async function audit({ actorId = null, action, entityType = null, entityId = null, summary = null, ip = null }) {
  try {
    await getPool().query(
      `INSERT INTO activity_logs (actor_id, action, entity_type, entity_id, summary, ip)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [actorId, action, entityType, entityId, summary?.slice(0, 500) ?? null, ip],
    );
  } catch (err) {
    logger.error({ err: err.message, action }, "Failed to write audit log");
  }
}

/** Convenience wrapper binding the request's actor + IP. */
export const auditReq = (req, entry) =>
  audit({ ...entry, actorId: req.user?.id ?? null, ip: req.ip });

import env from "../config/env.js";
import { getPool } from "../database/pool.js";
import logger from "../utils/logger.js";
import { sendMail } from "./mailer.js";

/**
 * DB-backed notification outbox.
 * Rows in `notifications` (status pending → sent|failed) with per-delivery
 * records in `notification_attempts`. Failures never roll back business work;
 * `deliverPending()` is safe to re-run — sent rows are never re-attempted.
 */

export async function enqueueEmail({ to, type, subject, text, html, entityType = null, entityId = null, conn = getPool() }) {
  if (!to) return null;
  const [r] = await conn.query(
    `INSERT INTO notifications (user_id, recipient, type, title, body, channel, status, entity_type, entity_id)
     VALUES (NULL, ?, ?, ?, ?, 'email', 'pending', ?, ?)`,
    // body holds JSON {text, html} so one column carries both formats.
    [to, type, subject, JSON.stringify({ text, html }), entityType, entityId],
  );
  return r.insertId;
}

const parseBody = (body) => {
  try {
    const parsed = JSON.parse(body);
    if (parsed && typeof parsed === "object" && "text" in parsed) return parsed;
  } catch { /* plain-text body */ }
  return { text: body, html: undefined };
};

export async function deliverNotification(row) {
  const pool = getPool();
  const attemptNo = row.attempts + 1;
  const { text, html } = parseBody(row.body);
  const okSend = await sendMail({ to: row.recipient, subject: row.title, text, html });
  await pool.query(
    `INSERT INTO notification_attempts (notification_id, attempt_no, status, error)
     VALUES (?, ?, ?, ?)`,
    [row.id, attemptNo, okSend ? "sent" : "failed", okSend ? null : "delivery failed or SMTP unconfigured"],
  );
  const exhausted = attemptNo >= env.NOTIFICATION_MAX_ATTEMPTS;
  await pool.query(
    `UPDATE notifications SET attempts = ?, status = ?, sent_at = ? WHERE id = ?`,
    [attemptNo, okSend ? "sent" : exhausted ? "failed" : "pending", okSend ? new Date() : null, row.id],
  );
  return okSend;
}

/** Processes a batch of pending notifications. Returns count attempted. */
export async function deliverPending(limit = 10) {
  const [rows] = await getPool().query(
    `SELECT id, recipient, title, body, attempts FROM notifications
      WHERE channel = 'email' AND status = 'pending'
        AND attempts < ?
      ORDER BY id LIMIT ?`,
    [env.NOTIFICATION_MAX_ATTEMPTS, limit],
  );
  for (const row of rows) {
    try {
      await deliverNotification(row);
    } catch (err) {
      logger.error({ err: err.message, id: row.id }, "Notification delivery error");
    }
  }
  return rows.length;
}

/** Periodic retry worker — call once at server start. */
export function startNotificationWorker(intervalMs = 60_000) {
  const timer = setInterval(() => {
    deliverPending().catch((err) =>
      logger.error({ err: err.message }, "Notification worker error"),
    );
  }, intervalMs);
  timer.unref();
  return timer;
}

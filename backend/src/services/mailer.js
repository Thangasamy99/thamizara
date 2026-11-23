import nodemailer from "nodemailer";
import env from "../config/env.js";
import logger from "../utils/logger.js";

let transporter;
let _sender; // test seam — injects a fake sender in automated tests

/** Test-only hook: replace the real SMTP sender. __setSender(null) restores. */
export const __setSender = (fn) => { _sender = fn; };
const getTransporter = () => {
  if (!env.SMTP_HOST) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
    });
  }
  return transporter;
};

/**
 * Sends an email. Never throws and never rolls back caller work — returns
 * false when SMTP is unconfigured or delivery fails so callers can proceed.
 */
export async function sendMail({ to, subject, text, html }) {
  if (_sender) return _sender({ to, subject, text, html });
  const t = getTransporter();
  if (!t) {
    logger.warn({ to, subject }, "SMTP not configured — email skipped");
    return false;
  }
  try {
    await t.sendMail({ from: env.MAIL_FROM, to, subject, text, html });
    return true;
  } catch (err) {
    logger.error({ err: err.message, to, subject }, "Email delivery failed");
    return false;
  }
}

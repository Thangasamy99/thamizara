/**
 * Thin client for the THAMIZARA backend API.
 *
 * Enabled only when VITE_API_BASE_URL is configured — without it the site
 * keeps its mailto/WhatsApp fallback behaviour. No secrets ever live here.
 */

const BASE = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");

export const apiEnabled = Boolean(BASE);

export class ApiError extends Error {
  constructor(status, message, errors) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

export async function postJson(path, body, { idempotencyKey } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {}),
    },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new ApiError(
      res.status,
      data?.message ?? `Request failed (${res.status})`,
      data?.errors,
    );
  }
  return data;
}

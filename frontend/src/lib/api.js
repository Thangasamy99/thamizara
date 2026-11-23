/**
 * Thin client for the THAMIZARA backend API.
 *
 * Enabled only when VITE_API_BASE_URL is configured — without it the site
 * keeps its mailto/WhatsApp fallback behaviour. No secrets ever live here.
 */

// Same-origin API on deployed hosts (Vercel routes /api/* to the backend);
// empty on localhost without an env var so the mailto fallback still works.
const isLocal = ["localhost", "127.0.0.1"].includes(window.location.hostname);
const BASE = (
  import.meta.env.VITE_API_BASE_URL ?? (isLocal ? "" : "/api/v1")
).replace(/\/$/, "");

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

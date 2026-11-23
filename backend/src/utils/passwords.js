import env from "../config/env.js";

// Password hashing via Web Crypto PBKDF2-SHA-256 — native code, works
// identically in Node 18+ and Cloudflare Workers (no bcrypt native addon,
// no slow pure-JS bcryptjs on the request path).
// Format: $pbkdf2-sha256$<iterations>$<salt-b64>$<hash-b64>
const ALGO = "pbkdf2-sha256";
const KEY_LEN = 32;
const SALT_LEN = 16;

const iterations = env.PASSWORD_HASH_ITERATIONS;

const toB64 = (buf) => Buffer.from(buf).toString("base64");
const fromB64 = (s) => new Uint8Array(Buffer.from(s, "base64"));

const derive = (password, salt, iters) =>
  crypto.subtle
    .importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"])
    .then((key) =>
      crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt, iterations: iters }, key, KEY_LEN * 8),
    )
    .then((bits) => new Uint8Array(bits));

// Constant-time compare — timingSafeEqual isn't guaranteed under workerd.
const safeEqual = (a, b) => {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
};

export async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LEN));
  const hash = await derive(password, salt, iterations);
  return `$${ALGO}$${iterations}$${toB64(salt)}$${toB64(hash)}`;
}

export async function verifyPassword(password, stored) {
  if (stored?.startsWith(`$${ALGO}$`)) {
    const [, , iters, saltB64, hashB64] = stored.split("$");
    const expected = fromB64(hashB64);
    const actual = await derive(password, fromB64(saltB64), Number(iters));
    return safeEqual(actual, expected);
  }
  // Legacy bcrypt hashes ($2a/$2b/…) — lazily imported so the Workers
  // bundle never executes bcryptjs unless a legacy hash is verified.
  // Note: bcryptjs is too slow for Workers' free CPU limit; such logins
  // only reliably succeed on Node deployments.
  const { default: bcrypt } = await import("bcryptjs");
  return bcrypt.compare(password, stored);
}

/** True when a stored hash predates PBKDF2 or uses fewer iterations. */
export const needsRehash = (stored) =>
  !stored?.startsWith(`$${ALGO}$`) || Number(stored.split("$")[2]) < iterations;

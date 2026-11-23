import crypto from "node:crypto";

/** Cryptographically random opaque token (URL-safe). */
export const randomToken = (bytes = 48) =>
  crypto.randomBytes(bytes).toString("base64url");

/** SHA-256 hex — deterministic hash stored in place of raw tokens. */
export const sha256 = (value) =>
  crypto.createHash("sha256").update(value).digest("hex");

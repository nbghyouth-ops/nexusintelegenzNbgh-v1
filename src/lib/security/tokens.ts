import { randomBytes, createHash, timingSafeEqual } from "crypto";

/**
 * Generates a cryptographically secure, URL-safe, non-enumerable token.
 * Used for tracking links, session cookies, and email pixel identifiers.
 */
export function generateSecureToken(bytes = 32): string {
  return randomBytes(bytes).toString("base64url");
}

/**
 * Tokens are never stored in plaintext in the database. We store a SHA-256
 * hash and compare hashes on lookup, similar to how password reset tokens
 * are typically handled.
 */
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function safeEqualHex(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "hex");
  const bufB = Buffer.from(b, "hex");
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

/** Hashes an IP address (for audit/visit logs) so raw IPs are never persisted. */
export function hashIp(ip: string | null | undefined): string | null {
  if (!ip) return null;
  return createHash("sha256").update(ip).digest("hex").slice(0, 32);
}

import { describe, it, expect } from "vitest";
import { generateSecureToken, hashToken, safeEqualHex, hashIp } from "@/lib/security/tokens";

describe("generateSecureToken", () => {
  it("produces URL-safe, non-enumerable, unique tokens", () => {
    const tokens = new Set(Array.from({ length: 200 }, () => generateSecureToken(32)));
    expect(tokens.size).toBe(200);
    for (const t of tokens) {
      expect(t).toMatch(/^[A-Za-z0-9_-]+$/);
      expect(t.length).toBeGreaterThan(30);
    }
  });
});

describe("hashToken", () => {
  it("is deterministic and one-way looking", () => {
    const token = "example-token-value";
    const h1 = hashToken(token);
    const h2 = hashToken(token);
    expect(h1).toBe(h2);
    expect(h1).not.toBe(token);
    expect(h1).toHaveLength(64); // sha256 hex
  });

  it("produces different hashes for different tokens", () => {
    expect(hashToken("a")).not.toBe(hashToken("b"));
  });
});

describe("safeEqualHex", () => {
  it("returns true only for identical hex strings", () => {
    const a = hashToken("same");
    const b = hashToken("same");
    const c = hashToken("different");
    expect(safeEqualHex(a, b)).toBe(true);
    expect(safeEqualHex(a, c)).toBe(false);
  });
});

describe("hashIp", () => {
  it("returns null for missing input", () => {
    expect(hashIp(null)).toBeNull();
    expect(hashIp(undefined)).toBeNull();
  });

  it("never returns the raw IP", () => {
    const ip = "203.0.113.42";
    expect(hashIp(ip)).not.toBe(ip);
  });
});

import { describe, it, expect } from "vitest";
import { locationSubmitSchema, registerSchema, trackingCreateSchema, paginationSchema } from "@/lib/validation";

describe("locationSubmitSchema", () => {
  it("rejects out-of-range coordinates", () => {
    const result = locationSubmitSchema.safeParse({
      token: "x".repeat(20),
      consentId: "123e4567-e89b-12d3-a456-426614174000",
      latitude: 999,
      longitude: 0,
    });
    expect(result.success).toBe(false);
  });

  it("accepts valid coordinates", () => {
    const result = locationSubmitSchema.safeParse({
      token: "x".repeat(20),
      consentId: "123e4567-e89b-12d3-a456-426614174000",
      latitude: 45.5,
      longitude: -122.6,
      accuracyMeters: 15,
    });
    expect(result.success).toBe(true);
  });
});

describe("registerSchema", () => {
  it("requires a minimum password length", () => {
    const result = registerSchema.safeParse({ name: "A B", email: "a@b.com", password: "short" });
    expect(result.success).toBe(false);
  });

  it("lowercases and trims email", () => {
    const result = registerSchema.safeParse({ name: "A B", email: "  A@B.COM  ", password: "longenoughpassword" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.email).toBe("a@b.com");
  });
});

describe("trackingCreateSchema", () => {
  it("caps expiry at 30 days", () => {
    const result = trackingCreateSchema.safeParse({ label: "test", purpose: "test purpose", expiresInHours: 24 * 31 });
    expect(result.success).toBe(false);
  });
});

describe("paginationSchema", () => {
  it("defaults page and pageSize when absent", () => {
    const result = paginationSchema.parse({});
    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(20);
  });

  it("rejects an oversized page size to prevent unbounded queries", () => {
    const result = paginationSchema.safeParse({ pageSize: 10_000 });
    expect(result.success).toBe(false);
  });
});

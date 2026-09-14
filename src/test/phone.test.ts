import { describe, it, expect } from "vitest";
import { analyzePhoneNumber } from "@/lib/phone";

describe("analyzePhoneNumber", () => {
  it("normalizes a valid US number to E.164", () => {
    const result = analyzePhoneNumber("+1 415-555-2671");
    expect(result.isValid).toBe(true);
    expect(result.e164).toBe("+14155552671");
  });

  it("reports invalid input honestly instead of guessing", () => {
    const result = analyzePhoneNumber("not-a-number");
    expect(result.isValid).toBe(false);
    expect(result.e164).toBeNull();
  });

  it("never returns location data", () => {
    const result = analyzePhoneNumber("+14155552671") as unknown as Record<string, unknown>;
    expect(result.latitude).toBeUndefined();
    expect(result.longitude).toBeUndefined();
    expect(result.cellId).toBeUndefined();
    expect(result.bts).toBeUndefined();
  });
});

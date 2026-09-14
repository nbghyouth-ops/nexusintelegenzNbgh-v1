import { describe, it, expect } from "vitest";
import { computeConfidence, computeStatus, selectBestEvidence } from "@/lib/location/confidence";

describe("computeConfidence", () => {
  it("returns VERY_HIGH for high-accuracy browser GPS", () => {
    expect(computeConfidence("BROWSER_GPS", 10)).toBe("VERY_HIGH");
  });

  it("degrades confidence as accuracy worsens", () => {
    expect(computeConfidence("BROWSER_GPS", 100)).toBe("HIGH");
    expect(computeConfidence("BROWSER_GPS", 1000)).toBe("MEDIUM");
    expect(computeConfidence("BROWSER_GPS", 6000)).toBe("LOW");
  });

  it("never rates IP estimates above LOW", () => {
    expect(computeConfidence("IP_ESTIMATE")).toBe("LOW");
  });

  it("rates manual entries as MEDIUM", () => {
    expect(computeConfidence("MANUAL")).toBe("MEDIUM");
  });

  it("rates unknown sources as VERY_LOW", () => {
    expect(computeConfidence("UNKNOWN")).toBe("VERY_LOW");
  });
});

describe("computeStatus", () => {
  it("returns UNAVAILABLE when there are no coordinates", () => {
    expect(computeStatus(new Date(), false)).toBe("UNAVAILABLE");
  });

  it("returns DENIED when explicitly denied regardless of coordinates", () => {
    expect(computeStatus(new Date(), true, true)).toBe("DENIED");
  });

  it("classifies fresh captures as LIVE", () => {
    expect(computeStatus(new Date(), true)).toBe("LIVE");
  });

  it("classifies old captures as EXPIRED", () => {
    const old = new Date(Date.now() - 1000 * 60 * 60 * 48);
    expect(computeStatus(old, true)).toBe("EXPIRED");
  });

  it("classifies mid-age captures as RECENT then STALE", () => {
    const recent = new Date(Date.now() - 1000 * 60 * 30);
    expect(computeStatus(recent, true)).toBe("RECENT");
    const stale = new Date(Date.now() - 1000 * 60 * 60 * 10);
    expect(computeStatus(stale, true)).toBe("STALE");
  });
});

describe("selectBestEvidence", () => {
  it("returns null for empty evidence", () => {
    expect(selectBestEvidence([])).toBeNull();
  });

  it("prefers higher confidence over recency", () => {
    const now = new Date();
    const evidence = [
      { id: "a", source: "IP_ESTIMATE" as const, confidence: "LOW" as const, capturedAt: now, accuracyMeters: null },
      { id: "b", source: "BROWSER_GPS" as const, confidence: "VERY_HIGH" as const, capturedAt: new Date(now.getTime() - 10000), accuracyMeters: 5 },
    ];
    expect(selectBestEvidence(evidence)?.id).toBe("b");
  });

  it("prefers better accuracy when confidence ties", () => {
    const now = new Date();
    const evidence = [
      { id: "a", source: "BROWSER_GPS" as const, confidence: "HIGH" as const, capturedAt: now, accuracyMeters: 200 },
      { id: "b", source: "BROWSER_GPS" as const, confidence: "HIGH" as const, capturedAt: now, accuracyMeters: 60 },
    ];
    expect(selectBestEvidence(evidence)?.id).toBe("b");
  });
});

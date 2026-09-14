export type LocationSource =
  | "BROWSER_GPS"
  | "EXIF_GPS"
  | "IP_ESTIMATE"
  | "MANUAL"
  | "UNKNOWN";

export type LocationConfidence =
  | "VERY_LOW"
  | "LOW"
  | "MEDIUM"
  | "HIGH"
  | "VERY_HIGH";

export type LocationStatus =
  | "LIVE"
  | "RECENT"
  | "STALE"
  | "EXPIRED"
  | "UNAVAILABLE"
  | "DENIED";

const CONFIDENCE_RANK: Record<LocationConfidence, number> = {
  VERY_LOW: 0,
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
  VERY_HIGH: 4,
};

const SOURCE_BASE_CONFIDENCE: Record<LocationSource, LocationConfidence> = {
  BROWSER_GPS: "VERY_HIGH",
  EXIF_GPS: "HIGH",
  IP_ESTIMATE: "LOW",
  MANUAL: "MEDIUM",
  UNKNOWN: "VERY_LOW",
};

/**
 * Derives confidence from source and (when available) reported accuracy.
 * This never fabricates a better confidence than the source justifies.
 */
export function computeConfidence(
  source: LocationSource,
  accuracyMeters?: number | null,
): LocationConfidence {
  let base = SOURCE_BASE_CONFIDENCE[source];

  if (source === "BROWSER_GPS" && typeof accuracyMeters === "number") {
    if (accuracyMeters > 5000) base = "LOW";
    else if (accuracyMeters > 500) base = "MEDIUM";
    else if (accuracyMeters > 50) base = "HIGH";
    else base = "VERY_HIGH";
  }

  return base;
}

/** Time thresholds used to classify how "fresh" a location record is. */
const LIVE_WINDOW_MS = 1000 * 60 * 5; // 5 minutes
const RECENT_WINDOW_MS = 1000 * 60 * 60; // 1 hour
const STALE_WINDOW_MS = 1000 * 60 * 60 * 24; // 24 hours

export function computeStatus(
  capturedAt: Date | null,
  hasCoordinates: boolean,
  denied = false,
): LocationStatus {
  if (denied) return "DENIED";
  if (!hasCoordinates || !capturedAt) return "UNAVAILABLE";

  const age = Date.now() - capturedAt.getTime();
  if (age < 0) return "RECENT";
  if (age <= LIVE_WINDOW_MS) return "LIVE";
  if (age <= RECENT_WINDOW_MS) return "RECENT";
  if (age <= STALE_WINDOW_MS) return "STALE";
  return "EXPIRED";
}

export type RankableEvidence = {
  id: string;
  source: LocationSource;
  confidence: LocationConfidence;
  accuracyMeters?: number | null;
  capturedAt: Date | null;
};

/**
 * Selects the best evidence record from a set using: confidence rank first,
 * then accuracy (lower is better), then recency. All evidence is preserved
 * in the database regardless of this selection — this only affects which
 * one is highlighted as the "primary" location for a case/session.
 */
export function selectBestEvidence<T extends RankableEvidence>(
  evidence: T[],
): T | null {
  if (evidence.length === 0) return null;
  return [...evidence].sort((a, b) => {
    const confDiff = CONFIDENCE_RANK[b.confidence] - CONFIDENCE_RANK[a.confidence];
    if (confDiff !== 0) return confDiff;

    const accA = a.accuracyMeters ?? Number.POSITIVE_INFINITY;
    const accB = b.accuracyMeters ?? Number.POSITIVE_INFINITY;
    if (accA !== accB) return accA - accB;

    const tA = a.capturedAt?.getTime() ?? 0;
    const tB = b.capturedAt?.getTime() ?? 0;
    return tB - tA;
  })[0]!;
}

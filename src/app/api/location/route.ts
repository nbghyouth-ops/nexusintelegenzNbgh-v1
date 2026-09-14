import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/db";
import { consents, locationEvidence, trackingSessions, notifications } from "@/db/schema";
import { eq } from "drizzle-orm";
import { locationSubmitSchema } from "@/lib/validation";
import { resolveTrackingToken } from "@/lib/tracking-resolve";
import { computeConfidence, computeStatus } from "@/lib/location/confidence";
import { logAudit } from "@/lib/audit";
import { getClientIp } from "@/lib/security/request";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req) ?? "unknown";
  if (!rateLimit(`location:${ip}`, 20, 60_000)) {
    return NextResponse.json({ error: "RATE_LIMITED" }, { status: 429 });
  }

  const json = await req.json().catch(() => null);
  const parsed = locationSubmitSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "VALIDATION_ERROR" }, { status: 400 });

  const { session, reason } = await resolveTrackingToken(parsed.data.token);
  if (!session || reason !== "OK") return NextResponse.json({ error: reason }, { status: 404 });

  const consentRows = await db.select().from(consents).where(eq(consents.id, parsed.data.consentId)).limit(1);
  const consent = consentRows[0];
  if (!consent || consent.trackingSessionId !== session.id) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }
  if (consent.status !== "PENDING") {
    return NextResponse.json({ error: "CONSENT_ALREADY_RESOLVED" }, { status: 409 });
  }

  const capturedAt = parsed.data.capturedAt ? new Date(parsed.data.capturedAt) : new Date();
  const confidence = computeConfidence("BROWSER_GPS", parsed.data.accuracyMeters ?? null);
  const status = computeStatus(capturedAt, true);

  await db.transaction(async (tx) => {
    await tx
      .update(consents)
      .set({ status: "GRANTED", grantedAt: new Date() })
      .where(eq(consents.id, consent.id));

    await tx.insert(locationEvidence).values({
      caseId: session.caseId,
      trackingSessionId: session.id,
      consentId: consent.id,
      latitude: parsed.data.latitude,
      longitude: parsed.data.longitude,
      accuracyMeters: parsed.data.accuracyMeters ?? null,
      source: "BROWSER_GPS",
      confidence,
      status,
      capturedAt,
      metadata: { userAgent: req.headers.get("user-agent") || null },
    });

    await tx
      .update(trackingSessions)
      .set({ lastVisitAt: new Date() })
      .where(eq(trackingSessions.id, session.id));

    await tx.insert(notifications).values({
      userId: session.creatorId,
      type: "LOCATION_RECEIVED",
      title: `Location received for "${session.label}"`,
      body: `Source: BROWSER_GPS · Confidence: ${confidence}`,
    });
  });

  await logAudit({
    action: "LOCATION_RECEIVED",
    targetType: "tracking_session",
    targetId: session.id,
    ip,
    metadata: { confidence, status },
  });

  return NextResponse.json({ ok: true, confidence, status });
}

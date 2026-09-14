import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { cameraSessions, consents } from "@/db/schema";
import { eq } from "drizzle-orm";
import { resolveTrackingToken } from "@/lib/tracking-resolve";
import { logAudit } from "@/lib/audit";
import { getClientIp } from "@/lib/security/request";

const bodySchema = z.object({
  token: z.string().min(10).max(200),
  consentId: z.string().uuid(),
});

export async function POST(req: NextRequest) {
  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "VALIDATION_ERROR" }, { status: 400 });

  const { session, reason } = await resolveTrackingToken(parsed.data.token);
  if (!session || reason !== "OK") return NextResponse.json({ error: reason }, { status: 404 });
  if (!session.requiresCamera) return NextResponse.json({ error: "NOT_REQUESTED" }, { status: 400 });

  const consentRows = await db.select().from(consents).where(eq(consents.id, parsed.data.consentId)).limit(1);
  const consent = consentRows[0];
  if (!consent || consent.trackingSessionId !== session.id || consent.status !== "PENDING") {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  await db.update(consents).set({ status: "GRANTED", grantedAt: new Date() }).where(eq(consents.id, consent.id));

  const inserted = await db
    .insert(cameraSessions)
    .values({
      caseId: session.caseId,
      trackingSessionId: session.id,
      consentId: consent.id,
      status: "ACTIVE",
      startedAt: new Date(),
    })
    .returning({ id: cameraSessions.id });

  await logAudit({
    action: "CAMERA_STARTED",
    targetType: "camera_session",
    targetId: inserted[0]!.id,
    ip: getClientIp(req),
  });

  return NextResponse.json({ cameraSessionId: inserted[0]!.id });
}

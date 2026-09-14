import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { consents, trackingSessions, notifications } from "@/db/schema";
import { eq } from "drizzle-orm";
import { logAudit } from "@/lib/audit";
import { getClientIp } from "@/lib/security/request";

const bodySchema = z.object({ consentId: z.string().uuid() });

export async function POST(req: NextRequest) {
  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "VALIDATION_ERROR" }, { status: 400 });

  const rows = await db.select().from(consents).where(eq(consents.id, parsed.data.consentId)).limit(1);
  const consent = rows[0];
  if (!consent) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  if (consent.status !== "PENDING") return NextResponse.json({ ok: true }); // idempotent

  await db
    .update(consents)
    .set({ status: "DENIED", deniedAt: new Date() })
    .where(eq(consents.id, consent.id));

  if (consent.trackingSessionId) {
    const sessionRows = await db
      .select({ creatorId: trackingSessions.creatorId, label: trackingSessions.label })
      .from(trackingSessions)
      .where(eq(trackingSessions.id, consent.trackingSessionId))
      .limit(1);
    const session = sessionRows[0];
    if (session) {
      await db.insert(notifications).values({
        userId: session.creatorId,
        type: "LOCATION_DENIED",
        title: `Permission denied on "${session.label}"`,
        body: `${consent.permissionType} permission was denied by the recipient.`,
      });
    }
  }

  await logAudit({
    action: "CONSENT_DENIED",
    targetType: "consent",
    targetId: consent.id,
    ip: getClientIp(req),
  });

  return NextResponse.json({ ok: true });
}

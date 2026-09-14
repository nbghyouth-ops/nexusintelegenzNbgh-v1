import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/db";
import { cameraSessions, cameraCaptures, trackingSessions, notifications } from "@/db/schema";
import { eq } from "drizzle-orm";
import { cameraCaptureSchema } from "@/lib/validation";
import { resolveTrackingToken } from "@/lib/tracking-resolve";
import { logAudit } from "@/lib/audit";
import { getClientIp } from "@/lib/security/request";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req) ?? "unknown";
  if (!rateLimit(`capture:${ip}`, 10, 60_000)) {
    return NextResponse.json({ error: "RATE_LIMITED" }, { status: 429 });
  }

  const json = await req.json().catch(() => null);
  const parsed = cameraCaptureSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "VALIDATION_ERROR" }, { status: 400 });

  const { session, reason } = await resolveTrackingToken(parsed.data.token);
  if (!session || reason !== "OK") return NextResponse.json({ error: reason }, { status: 404 });

  const sessionRows = await db.select().from(cameraSessions).where(eq(cameraSessions.id, parsed.data.cameraSessionId)).limit(1);
  const cameraSession = sessionRows[0];
  if (!cameraSession || cameraSession.trackingSessionId !== session.id) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }
  if (cameraSession.status === "COMPLETED") {
    return NextResponse.json({ error: "ALREADY_COMPLETED" }, { status: 409 });
  }

  // Reject payloads that are not valid base64 or exceed a sane decoded size.
  const approxBytes = (parsed.data.dataBase64.length * 3) / 4;
  if (approxBytes > 12 * 1024 * 1024) {
    return NextResponse.json({ error: "UPLOAD_REJECTED" }, { status: 413 });
  }

  await db.transaction(async (tx) => {
    await tx.insert(cameraCaptures).values({
      cameraSessionId: cameraSession.id,
      mimeType: parsed.data.mimeType,
      dataBase64: parsed.data.dataBase64,
    });
    await tx
      .update(cameraSessions)
      .set({ status: "COMPLETED", endedAt: new Date() })
      .where(eq(cameraSessions.id, cameraSession.id));

    await tx.insert(notifications).values({
      userId: session.creatorId,
      type: "CAMERA_CAPTURED",
      title: `Camera capture received for "${session.label}"`,
    });
  });

  await logAudit({
    action: "CAMERA_CAPTURED",
    targetType: "camera_session",
    targetId: cameraSession.id,
    ip,
  });

  return NextResponse.json({ ok: true });
}

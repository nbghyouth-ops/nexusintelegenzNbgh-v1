import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/db";
import { emailTrackingSessions, emailTrackingEvents } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hashIp } from "@/lib/security/tokens";
import { getClientIp } from "@/lib/security/request";
import { logAudit } from "@/lib/audit";

// A 1x1 transparent PNG.
const PIXEL = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
  "base64",
);

export async function GET(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const rows = await db.select().from(emailTrackingSessions).where(eq(emailTrackingSessions.pixelToken, token)).limit(1);
  const session = rows[0];

  if (session && session.status === "ACTIVE") {
    await db.insert(emailTrackingEvents).values({
      sessionId: session.id,
      status: "OPEN_SIGNAL",
      ipHash: hashIp(getClientIp(req)),
      userAgent: req.headers.get("user-agent"),
    });
    await logAudit({
      action: "EMAIL_OPEN_SIGNAL",
      targetType: "email_tracking_session",
      targetId: session.id,
      ip: getClientIp(req),
    });
  }

  return new NextResponse(PIXEL, {
    status: 200,
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}

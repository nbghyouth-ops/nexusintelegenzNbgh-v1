import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { consents } from "@/db/schema";
import { resolveTrackingToken } from "@/lib/tracking-resolve";
import { rateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/security/request";

const bodySchema = z.object({
  token: z.string().min(10).max(200),
  type: z.enum(["LOCATION", "CAMERA"]),
});

export async function POST(req: NextRequest) {
  const ip = getClientIp(req) ?? "unknown";
  if (!rateLimit(`consent:${ip}`, 30, 60_000)) {
    return NextResponse.json({ error: "RATE_LIMITED" }, { status: 429 });
  }

  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "VALIDATION_ERROR" }, { status: 400 });
  }

  const { session, reason } = await resolveTrackingToken(parsed.data.token);
  if (!session || reason !== "OK") {
    return NextResponse.json({ error: reason }, { status: 404 });
  }

  if (parsed.data.type === "LOCATION" && !session.requiresLocation) {
    return NextResponse.json({ error: "NOT_REQUESTED" }, { status: 400 });
  }
  if (parsed.data.type === "CAMERA" && !session.requiresCamera) {
    return NextResponse.json({ error: "NOT_REQUESTED" }, { status: 400 });
  }

  const inserted = await db
    .insert(consents)
    .values({
      trackingSessionId: session.id,
      permissionType: parsed.data.type,
      purpose: session.purpose,
      status: "PENDING",
      userAgent: req.headers.get("user-agent") || null,
    })
    .returning({ id: consents.id });

  return NextResponse.json({ consentId: inserted[0]!.id });
}

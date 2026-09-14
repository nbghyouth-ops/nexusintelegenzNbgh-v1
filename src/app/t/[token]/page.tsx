import type { Metadata } from "next";
import { headers } from "next/headers";
import { db } from "@/db";
import { trackingSessions, trackingVisits } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { resolveTrackingToken } from "@/lib/tracking-resolve";
import { classifyUserAgent, getClientIp } from "@/lib/security/request";
import { hashIp } from "@/lib/security/tokens";
import { logAudit } from "@/lib/audit";
import { TrackingConsentFlow } from "./consent-flow";

export const metadata: Metadata = { title: "Verification Link", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function PublicTrackingPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const { session, reason } = await resolveTrackingToken(token);

  if (!session) {
    return <StatusScreen title="Link not found" message="This verification link does not exist or has been removed." />;
  }

  if (reason === "REVOKED") {
    return <StatusScreen title="Link revoked" message="This verification link has been revoked by its creator and can no longer be used." />;
  }
  if (reason === "DISABLED") {
    return <StatusScreen title="Link disabled" message="This verification link is currently disabled." />;
  }
  if (reason === "EXPIRED") {
    return <StatusScreen title="Link expired" message="This verification link has expired and can no longer accept new evidence." />;
  }

  // Record an ordinary web visit (request metadata only — never GPS).
  const h = await headers();
  const ua = h.get("user-agent");
  const { deviceType, browser, os } = classifyUserAgent(ua);
  const ip = getClientIp({ headers: h } as unknown as Request);

  await db.insert(trackingVisits).values({
    sessionId: session.id,
    ipHash: hashIp(ip),
    userAgent: ua,
    deviceType,
    browser,
    os,
    referrer: h.get("referer"),
    language: h.get("accept-language")?.split(",")[0] ?? null,
  });

  await db
    .update(trackingSessions)
    .set({
      visitCount: sql`${trackingSessions.visitCount} + 1`,
      firstVisitAt: sql`coalesce(${trackingSessions.firstVisitAt}, now())`,
      lastVisitAt: sql`now()`,
    })
    .where(eq(trackingSessions.id, session.id));

  await logAudit({ action: "VISIT_RECEIVED", targetType: "tracking_session", targetId: session.id, ip });

  return (
    <TrackingConsentFlow
      token={token}
      label={session.label}
      purpose={session.purpose}
      requiresLocation={session.requiresLocation}
      requiresCamera={session.requiresCamera}
    />
  );
}

function StatusScreen({ title, message }: { title: string; message: string }) {
  return (
    <main className="grid-fade flex min-h-screen items-center justify-center bg-[color:var(--color-bg)] px-4">
      <div className="panel max-w-md p-8 text-center">
        <p className="font-display text-xs uppercase tracking-widest text-accent">Helix Verify</p>
        <h1 className="mt-3 font-display text-xl text-[color:var(--color-text)]">{title}</h1>
        <p className="mt-3 text-sm text-[color:var(--color-text-dim)]">{message}</p>
      </div>
    </main>
  );
}

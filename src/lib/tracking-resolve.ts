import "server-only";
import { db } from "@/db";
import { trackingSessions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hashToken } from "@/lib/security/tokens";

export type ResolvedSession = Awaited<ReturnType<typeof resolveTrackingToken>>;

/**
 * Resolves a raw tracking token to its session row, enforcing expiry.
 * Never accepts a client-supplied session ID in place of the token — the
 * token itself is the only valid credential for public tracking endpoints.
 */
export async function resolveTrackingToken(token: string) {
  const tokenHash = hashToken(token);
  const rows = await db.select().from(trackingSessions).where(eq(trackingSessions.tokenHash, tokenHash)).limit(1);
  const session = rows[0];
  if (!session) return { session: null as null, reason: "NOT_FOUND" as const };

  if (session.status === "REVOKED") return { session, reason: "REVOKED" as const };
  if (session.status === "DISABLED") return { session, reason: "DISABLED" as const };

  if (session.expiresAt.getTime() < Date.now()) {
    if (session.status !== "EXPIRED") {
      await db.update(trackingSessions).set({ status: "EXPIRED" }).where(eq(trackingSessions.id, session.id));
    }
    return { session, reason: "EXPIRED" as const };
  }

  return { session, reason: "OK" as const };
}

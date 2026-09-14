"use server";

import { db } from "@/db";
import { trackingSessions } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import { hasPermission } from "@/lib/auth/rbac";
import { trackingCreateSchema } from "@/lib/validation";
import { generateSecureToken, hashToken } from "@/lib/security/tokens";
import { logAudit } from "@/lib/audit";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

export type CreateTrackingResult = { error?: string; token?: string; sessionId?: string };

export async function createTrackingSessionAction(
  _prev: CreateTrackingResult,
  formData: FormData,
): Promise<CreateTrackingResult> {
  const user = await getCurrentUser();
  if (!user) return { error: "AUTH_REQUIRED" };
  if (!hasPermission(user.role, "tracking.create")) return { error: "FORBIDDEN" };

  const parsed = trackingCreateSchema.safeParse({
    label: formData.get("label"),
    purpose: formData.get("purpose"),
    caseId: formData.get("caseId") || undefined,
    requiresLocation: formData.get("requiresLocation") === "on",
    requiresCamera: formData.get("requiresCamera") === "on",
    expiresInHours: Number(formData.get("expiresInHours") || 72),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "VALIDATION_ERROR" };

  const token = generateSecureToken(32);
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + parsed.data.expiresInHours * 60 * 60 * 1000);

  const inserted = await db
    .insert(trackingSessions)
    .values({
      caseId: parsed.data.caseId || null,
      creatorId: user.id,
      tokenHash,
      label: parsed.data.label,
      purpose: parsed.data.purpose,
      requiresLocation: parsed.data.requiresLocation,
      requiresCamera: parsed.data.requiresCamera,
      expiresAt,
    })
    .returning({ id: trackingSessions.id });

  await logAudit({
    actorId: user.id,
    action: "TRACKING_CREATED",
    targetType: "tracking_session",
    targetId: inserted[0]!.id,
  });

  revalidatePath("/tracking");
  return { token, sessionId: inserted[0]!.id };
}

export async function revokeTrackingSessionAction(sessionId: string): Promise<void> {
  const user = await getCurrentUser();
  if (!user) return;
  if (!hasPermission(user.role, "tracking.revoke")) return;

  await db
    .update(trackingSessions)
    .set({ status: "REVOKED", revokedAt: new Date() })
    .where(eq(trackingSessions.id, sessionId));

  await logAudit({
    actorId: user.id,
    action: "TRACKING_REVOKED",
    targetType: "tracking_session",
    targetId: sessionId,
  });

  revalidatePath("/tracking");
  revalidatePath(`/tracking/${sessionId}`);
}

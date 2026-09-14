"use server";

import { db } from "@/db";
import { emailTrackingSessions } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import { emailTrackingCreateSchema } from "@/lib/validation";
import { generateSecureToken } from "@/lib/security/tokens";
import { logAudit } from "@/lib/audit";
import { revalidatePath } from "next/cache";

export type ActionResult = { error?: string };

export async function createEmailTrackingAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { error: "AUTH_REQUIRED" };

  const parsed = emailTrackingCreateSchema.safeParse({
    targetEmail: formData.get("targetEmail"),
    subject: formData.get("subject") || undefined,
    caseId: formData.get("caseId") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "VALIDATION_ERROR" };

  const pixelToken = generateSecureToken(24);

  const inserted = await db
    .insert(emailTrackingSessions)
    .values({
      creatorId: user.id,
      targetEmail: parsed.data.targetEmail,
      subject: parsed.data.subject ?? null,
      caseId: parsed.data.caseId || null,
      pixelToken,
    })
    .returning({ id: emailTrackingSessions.id });

  await logAudit({ actorId: user.id, action: "EMAIL_TRACKING_CREATED", targetType: "email_tracking_session", targetId: inserted[0]!.id });
  revalidatePath("/events");
  return {};
}

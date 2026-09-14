"use server";

import { db } from "@/db";
import { users, passwordResetTokens } from "@/db/schema";
import { eq, and, gt, isNull } from "drizzle-orm";
import { emailSchema, passwordSchema } from "@/lib/validation";
import { generateSecureToken, hashToken } from "@/lib/security/tokens";
import { hashPassword } from "@/lib/auth/password";
import { logAudit } from "@/lib/audit";

export type ResetResult = { error?: string; devResetLink?: string; success?: boolean };

/**
 * No transactional email provider is configured in this zero-cost MVP (see
 * /docs/ARCHITECTURE.md). In production, wire this to an email provider and
 * remove `devResetLink` from the response — it exists only so this flow is
 * testable end-to-end without a mail server.
 */
export async function requestPasswordResetAction(_prev: ResetResult, formData: FormData): Promise<ResetResult> {
  const parsed = emailSchema.safeParse(formData.get("email"));
  if (!parsed.success) return { error: "VALIDATION_ERROR" };

  const rows = await db.select({ id: users.id }).from(users).where(eq(users.email, parsed.data)).limit(1);
  const user = rows[0];

  // Always behave the same way whether or not the account exists, to avoid
  // leaking account existence via response timing/shape.
  if (!user) {
    return { success: true };
  }

  const token = generateSecureToken(24);
  const tokenHash = hashToken(token);
  await db.insert(passwordResetTokens).values({
    userId: user.id,
    tokenHash,
    expiresAt: new Date(Date.now() + 1000 * 60 * 30),
  });

  return { success: true, devResetLink: `/reset-password/${token}` };
}

export async function resetPasswordAction(token: string, _prev: ResetResult, formData: FormData): Promise<ResetResult> {
  const parsed = passwordSchema.safeParse(formData.get("password"));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "VALIDATION_ERROR" };

  const tokenHash = hashToken(token);
  const rows = await db
    .select()
    .from(passwordResetTokens)
    .where(and(eq(passwordResetTokens.tokenHash, tokenHash), isNull(passwordResetTokens.usedAt), gt(passwordResetTokens.expiresAt, new Date())))
    .limit(1);

  const record = rows[0];
  if (!record) return { error: "SESSION_EXPIRED" };

  const passwordHash = await hashPassword(parsed.data);
  await db.update(users).set({ passwordHash, updatedAt: new Date() }).where(eq(users.id, record.userId));
  await db.update(passwordResetTokens).set({ usedAt: new Date() }).where(eq(passwordResetTokens.id, record.id));
  await logAudit({ actorId: record.userId, action: "USER_UPDATED", targetType: "user", targetId: record.userId, metadata: { passwordReset: true } });

  return { success: true };
}

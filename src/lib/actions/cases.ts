"use server";

import { db } from "@/db";
import { cases, caseNotes } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import { hasPermission } from "@/lib/auth/rbac";
import { caseCreateSchema, caseUpdateSchema } from "@/lib/validation";
import { nextCaseNumber } from "@/lib/case-number";
import { logAudit } from "@/lib/audit";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

export type ActionResult = { error?: string };

export async function createCaseAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { error: "AUTH_REQUIRED" };
  if (!hasPermission(user.role, "cases.create")) return { error: "FORBIDDEN" };

  const parsed = caseCreateSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "VALIDATION_ERROR" };

  const caseNumber = await nextCaseNumber();
  const inserted = await db
    .insert(cases)
    .values({
      caseNumber,
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      ownerId: user.id,
    })
    .returning({ id: cases.id });

  await logAudit({ actorId: user.id, action: "CASE_CREATED", targetType: "case", targetId: inserted[0]!.id });
  revalidatePath("/cases");
  redirect(`/cases/${inserted[0]!.id}`);
}

export async function updateCaseAction(caseId: string, _prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { error: "AUTH_REQUIRED" };
  if (!hasPermission(user.role, "cases.update")) return { error: "FORBIDDEN" };

  const parsed = caseUpdateSchema.safeParse({
    title: formData.get("title") || undefined,
    description: formData.get("description") || undefined,
    status: formData.get("status") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "VALIDATION_ERROR" };

  await db
    .update(cases)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(cases.id, caseId));

  await logAudit({ actorId: user.id, action: "CASE_UPDATED", targetType: "case", targetId: caseId });
  revalidatePath(`/cases/${caseId}`);
  revalidatePath("/cases");
  return {};
}

export async function addCaseNoteAction(caseId: string, _prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { error: "AUTH_REQUIRED" };
  if (!hasPermission(user.role, "cases.update")) return { error: "FORBIDDEN" };

  const body = String(formData.get("body") || "").trim();
  if (!body || body.length > 5000) return { error: "VALIDATION_ERROR" };

  await db.insert(caseNotes).values({ caseId, authorId: user.id, body });
  revalidatePath(`/cases/${caseId}`);
  return {};
}

export async function deleteCaseAction(caseId: string): Promise<void> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!hasPermission(user.role, "cases.delete")) redirect(`/cases/${caseId}`);

  await db.delete(cases).where(eq(cases.id, caseId));
  await logAudit({ actorId: user.id, action: "CASE_DELETED", targetType: "case", targetId: caseId });
  revalidatePath("/cases");
  redirect("/cases");
}

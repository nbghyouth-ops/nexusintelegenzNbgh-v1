"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import { hasPermission, type Role } from "@/lib/auth/rbac";
import { logAudit } from "@/lib/audit";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

const VALID_ROLES: Role[] = ["SUPER_ADMIN", "ADMIN", "OPERATOR", "USER"];

export async function updateUserRoleAction(userId: string, formData: FormData): Promise<void> {
  const actor = await getCurrentUser();
  if (!actor) return;
  if (!hasPermission(actor.role, "users.manage")) return;

  const role = formData.get("role");
  if (typeof role !== "string" || !VALID_ROLES.includes(role as Role)) return;

  await db.update(users).set({ role: role as Role, updatedAt: new Date() }).where(eq(users.id, userId));
  await logAudit({ actorId: actor.id, action: "ROLE_CHANGED", targetType: "user", targetId: userId, metadata: { role } });
  revalidatePath("/users");
}

export async function toggleUserActiveAction(userId: string, nextActive: boolean): Promise<void> {
  const actor = await getCurrentUser();
  if (!actor) return;
  if (!hasPermission(actor.role, "users.manage")) return;
  if (actor.id === userId) return; // cannot deactivate self

  await db.update(users).set({ isActive: nextActive, updatedAt: new Date() }).where(eq(users.id, userId));
  await logAudit({ actorId: actor.id, action: "USER_UPDATED", targetType: "user", targetId: userId, metadata: { isActive: nextActive } });
  revalidatePath("/users");
}

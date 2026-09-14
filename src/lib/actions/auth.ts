"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createSession, destroySession } from "@/lib/auth/session";
import { registerSchema, loginSchema } from "@/lib/validation";
import { logAudit } from "@/lib/audit";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export type ActionResult = { error?: string };

async function currentIp(): Promise<string | null> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
}

export async function registerAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { name, email, password } = parsed.data;

  const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (existing.length > 0) {
    return { error: "An account with this email already exists." };
  }

  const passwordHash = await hashPassword(password);
  // First account ever created becomes SUPER_ADMIN; everyone else is USER.
  const totalUsers = await db.select({ id: users.id }).from(users).limit(1);
  const role = totalUsers.length === 0 ? "SUPER_ADMIN" : "USER";

  const inserted = await db
    .insert(users)
    .values({ name, email, passwordHash, role })
    .returning({ id: users.id });

  await createSession(inserted[0]!.id);
  await logAudit({ actorId: inserted[0]!.id, action: "REGISTER", ip: await currentIp() });
  redirect("/dashboard");
}

export async function loginAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: "Invalid email or password." };
  }
  const { email, password } = parsed.data;

  const rows = await db.select().from(users).where(eq(users.email, email)).limit(1);
  const user = rows[0];
  const ip = await currentIp();

  if (!user || !user.isActive) {
    await logAudit({ action: "LOGIN_FAILED", ip, metadata: { email } });
    return { error: "Invalid email or password." };
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    await logAudit({ actorId: user.id, action: "LOGIN_FAILED", ip });
    return { error: "Invalid email or password." };
  }

  await createSession(user.id);
  await logAudit({ actorId: user.id, action: "LOGIN", ip });
  redirect("/dashboard");
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/login");
}

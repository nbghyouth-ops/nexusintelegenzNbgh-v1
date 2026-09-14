"use server";

import { db } from "@/db";
import { systemSettings } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import { hasPermission } from "@/lib/auth/rbac";
import { logAudit } from "@/lib/audit";
import { revalidatePath } from "next/cache";
import { sql } from "drizzle-orm";

export type ActionResult = { error?: string };

export async function updateSettingsAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { error: "AUTH_REQUIRED" };
  if (!hasPermission(user.role, "settings.manage")) return { error: "FORBIDDEN" };

  const value = {
    trackingRetentionDays: Number(formData.get("trackingRetentionDays") || 90),
    locationRetentionDays: Number(formData.get("locationRetentionDays") || 90),
    photoRetentionDays: Number(formData.get("photoRetentionDays") || 180),
    cameraRetentionDays: Number(formData.get("cameraRetentionDays") || 90),
    auditRetentionDays: Number(formData.get("auditRetentionDays") || 365),
    features: {
      tracking_enabled: formData.get("tracking_enabled") === "on",
      location_enabled: formData.get("location_enabled") === "on",
      camera_enabled: formData.get("camera_enabled") === "on",
      phone_enabled: formData.get("phone_enabled") === "on",
      photos_enabled: formData.get("photos_enabled") === "on",
      analytics_enabled: formData.get("analytics_enabled") === "on",
    },
  };

  await db
    .insert(systemSettings)
    .values({ key: "global", value, updatedAt: new Date() })
    .onConflictDoUpdate({ target: systemSettings.key, set: { value, updatedAt: new Date() } });

  await logAudit({ actorId: user.id, action: "SETTINGS_CHANGED", targetType: "system_settings", targetId: "global" });
  revalidatePath("/settings");
  return {};
}

export async function getGlobalSettings() {
  const rows = await db.select().from(systemSettings).where(sql`${systemSettings.key} = 'global'`).limit(1);
  return (
    (rows[0]?.value as {
      trackingRetentionDays: number;
      locationRetentionDays: number;
      photoRetentionDays: number;
      cameraRetentionDays: number;
      auditRetentionDays: number;
      features: Record<string, boolean>;
    } | undefined) ?? {
      trackingRetentionDays: 90,
      locationRetentionDays: 90,
      photoRetentionDays: 180,
      cameraRetentionDays: 90,
      auditRetentionDays: 365,
      features: {
        tracking_enabled: true,
        location_enabled: true,
        camera_enabled: true,
        phone_enabled: true,
        photos_enabled: true,
        analytics_enabled: true,
      },
    }
  );
}

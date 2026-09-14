import "server-only";
import { db } from "@/db";
import { auditLogs } from "@/db/schema";
import { hashIp } from "@/lib/security/tokens";

export type AuditAction =
  | "LOGIN"
  | "LOGIN_FAILED"
  | "LOGOUT"
  | "REGISTER"
  | "CASE_CREATED"
  | "CASE_UPDATED"
  | "CASE_DELETED"
  | "TRACKING_CREATED"
  | "TRACKING_REVOKED"
  | "VISIT_RECEIVED"
  | "LOCATION_RECEIVED"
  | "LOCATION_ACCESSED"
  | "LOCATION_DELETED"
  | "PHOTO_UPLOADED"
  | "PHOTO_PROCESSED"
  | "PHOTO_DELETED"
  | "CAMERA_STARTED"
  | "CAMERA_CAPTURED"
  | "CAMERA_STOPPED"
  | "CONSENT_GRANTED"
  | "CONSENT_DENIED"
  | "CONSENT_REVOKED"
  | "USER_UPDATED"
  | "ROLE_CHANGED"
  | "SETTINGS_CHANGED"
  | "PHONE_LOOKUP"
  | "EMAIL_TRACKING_CREATED"
  | "EMAIL_OPEN_SIGNAL";

export async function logAudit(params: {
  actorId?: string | null;
  action: AuditAction;
  targetType?: string;
  targetId?: string;
  ip?: string | null;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  try {
    await db.insert(auditLogs).values({
      actorId: params.actorId ?? null,
      action: params.action,
      targetType: params.targetType,
      targetId: params.targetId,
      ipHash: hashIp(params.ip),
      metadata: params.metadata ?? {},
    });
  } catch (err) {
    // Audit logging must never crash the primary request flow.
    console.error("audit_log_failed", err);
  }
}

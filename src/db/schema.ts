import {
  pgTable,
  pgEnum,
  uuid,
  text,
  timestamp,
  integer,
  boolean,
  jsonb,
  doublePrecision,
  serial,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

// ============================================================
// ENUMS
// ============================================================

export const roleEnum = pgEnum("role", [
  "SUPER_ADMIN",
  "ADMIN",
  "OPERATOR",
  "USER",
]);

export const caseStatusEnum = pgEnum("case_status", [
  "OPEN",
  "PROCESSING",
  "COMPLETED",
  "ARCHIVED",
  "CANCELLED",
]);

export const trackingStatusEnum = pgEnum("tracking_status", [
  "ACTIVE",
  "EXPIRED",
  "REVOKED",
  "DISABLED",
]);

export const consentTypeEnum = pgEnum("consent_type", ["LOCATION", "CAMERA"]);

export const consentStatusEnum = pgEnum("consent_status", [
  "PENDING",
  "GRANTED",
  "DENIED",
  "REVOKED",
  "EXPIRED",
]);

export const locationSourceEnum = pgEnum("location_source", [
  "BROWSER_GPS",
  "EXIF_GPS",
  "IP_ESTIMATE",
  "MANUAL",
  "UNKNOWN",
]);

export const locationConfidenceEnum = pgEnum("location_confidence", [
  "VERY_LOW",
  "LOW",
  "MEDIUM",
  "HIGH",
  "VERY_HIGH",
]);

export const locationStatusEnum = pgEnum("location_status", [
  "LIVE",
  "RECENT",
  "STALE",
  "EXPIRED",
  "UNAVAILABLE",
  "DENIED",
]);

export const photoStatusEnum = pgEnum("photo_status", [
  "UPLOADED",
  "PROCESSING",
  "ANALYZED",
  "NO_METADATA",
  "ERROR",
]);

export const cameraStatusEnum = pgEnum("camera_status", [
  "WAITING_PERMISSION",
  "ACTIVE",
  "CAPTURED",
  "UPLOADING",
  "COMPLETED",
  "DENIED",
  "ERROR",
]);

export const notificationTypeEnum = pgEnum("notification_type", [
  "TRACKING_CREATED",
  "VISIT_RECEIVED",
  "LOCATION_RECEIVED",
  "LOCATION_DENIED",
  "CAMERA_CAPTURED",
  "PHOTO_PROCESSED",
  "SESSION_EXPIRED",
  "CASE_UPDATED",
  "SYSTEM_WARNING",
]);

export const emailEventStatusEnum = pgEnum("email_event_status", [
  "SENT",
  "DELIVERED",
  "OPEN_SIGNAL",
  "LINK_CLICK",
  "FAILED",
  "UNKNOWN",
]);

// ============================================================
// USERS & AUTH
// ============================================================

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  role: roleEnum("role").notNull().default("USER"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  emailUnique: uniqueIndex("users_email_unique").on(table.email),
}));

export const sessions = pgTable("sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull(),
  userAgent: text("user_agent"),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  tokenHashUnique: uniqueIndex("sessions_token_hash_unique").on(table.tokenHash),
  userIdx: index("sessions_user_idx").on(table.userId),
}));

export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  usedAt: timestamp("used_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  tokenHashUnique: uniqueIndex("password_reset_tokens_hash_unique").on(table.tokenHash),
  userIdx: index("password_reset_tokens_user_idx").on(table.userId),
}));

// ============================================================
// CASES
// ============================================================

export const caseNumberSeq = pgTable("case_number_seq", {
  id: serial("id").primaryKey(),
});

export const cases = pgTable("cases", {
  id: uuid("id").defaultRandom().primaryKey(),
  caseNumber: text("case_number").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  status: caseStatusEnum("status").notNull().default("OPEN"),
  ownerId: uuid("owner_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  caseNumberUnique: uniqueIndex("cases_case_number_unique").on(table.caseNumber),
  ownerIdx: index("cases_owner_idx").on(table.ownerId),
  statusIdx: index("cases_status_idx").on(table.status),
}));

export const caseNotes = pgTable("case_notes", {
  id: uuid("id").defaultRandom().primaryKey(),
  caseId: uuid("case_id").notNull().references(() => cases.id, { onDelete: "cascade" }),
  authorId: uuid("author_id").notNull().references(() => users.id),
  body: text("body").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  caseIdx: index("case_notes_case_idx").on(table.caseId),
}));

// ============================================================
// TRACKING SESSIONS / VISITS
// ============================================================

export const trackingSessions = pgTable("tracking_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  caseId: uuid("case_id").references(() => cases.id, { onDelete: "set null" }),
  creatorId: uuid("creator_id").notNull().references(() => users.id),
  tokenHash: text("token_hash").notNull(),
  label: text("label").notNull(),
  purpose: text("purpose").notNull(),
  requiresLocation: boolean("requires_location").notNull().default(true),
  requiresCamera: boolean("requires_camera").notNull().default(false),
  status: trackingStatusEnum("status").notNull().default("ACTIVE"),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  revokedAt: timestamp("revoked_at", { withTimezone: true }),
  firstVisitAt: timestamp("first_visit_at", { withTimezone: true }),
  lastVisitAt: timestamp("last_visit_at", { withTimezone: true }),
  visitCount: integer("visit_count").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  tokenHashUnique: uniqueIndex("tracking_sessions_token_hash_unique").on(table.tokenHash),
  creatorIdx: index("tracking_sessions_creator_idx").on(table.creatorId),
  caseIdx: index("tracking_sessions_case_idx").on(table.caseId),
  statusIdx: index("tracking_sessions_status_idx").on(table.status),
}));

export const trackingVisits = pgTable("tracking_visits", {
  id: uuid("id").defaultRandom().primaryKey(),
  sessionId: uuid("session_id").notNull().references(() => trackingSessions.id, { onDelete: "cascade" }),
  occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull().defaultNow(),
  ipHash: text("ip_hash"),
  userAgent: text("user_agent"),
  deviceType: text("device_type"),
  browser: text("browser"),
  os: text("os"),
  referrer: text("referrer"),
  language: text("language"),
}, (table) => ({
  sessionIdx: index("tracking_visits_session_idx").on(table.sessionId),
  occurredIdx: index("tracking_visits_occurred_idx").on(table.occurredAt),
}));

// ============================================================
// CONSENT
// ============================================================

export const consents = pgTable("consents", {
  id: uuid("id").defaultRandom().primaryKey(),
  trackingSessionId: uuid("tracking_session_id").references(() => trackingSessions.id, { onDelete: "cascade" }),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  permissionType: consentTypeEnum("permission_type").notNull(),
  purpose: text("purpose").notNull(),
  version: text("version").notNull().default("1.0"),
  status: consentStatusEnum("status").notNull().default("PENDING"),
  grantedAt: timestamp("granted_at", { withTimezone: true }),
  deniedAt: timestamp("denied_at", { withTimezone: true }),
  revokedAt: timestamp("revoked_at", { withTimezone: true }),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  userAgent: text("user_agent"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  sessionIdx: index("consents_session_idx").on(table.trackingSessionId),
  userIdx: index("consents_user_idx").on(table.userId),
}));

// ============================================================
// LOCATION EVIDENCE
// ============================================================

export const locationEvidence = pgTable("location_evidence", {
  id: uuid("id").defaultRandom().primaryKey(),
  caseId: uuid("case_id").references(() => cases.id, { onDelete: "set null" }),
  trackingSessionId: uuid("tracking_session_id").references(() => trackingSessions.id, { onDelete: "set null" }),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  consentId: uuid("consent_id").references(() => consents.id, { onDelete: "set null" }),
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
  accuracyMeters: doublePrecision("accuracy_meters"),
  source: locationSourceEnum("source").notNull(),
  confidence: locationConfidenceEnum("confidence").notNull(),
  status: locationStatusEnum("status").notNull().default("UNAVAILABLE"),
  provider: text("provider"),
  capturedAt: timestamp("captured_at", { withTimezone: true }),
  receivedAt: timestamp("received_at", { withTimezone: true }).notNull().defaultNow(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  caseIdx: index("location_evidence_case_idx").on(table.caseId),
  sessionIdx: index("location_evidence_session_idx").on(table.trackingSessionId),
  receivedIdx: index("location_evidence_received_idx").on(table.receivedAt),
}));

// ============================================================
// PHOTOS
// ============================================================

export const photoRecords = pgTable("photo_records", {
  id: uuid("id").defaultRandom().primaryKey(),
  caseId: uuid("case_id").references(() => cases.id, { onDelete: "set null" }),
  trackingSessionId: uuid("tracking_session_id").references(() => trackingSessions.id, { onDelete: "set null" }),
  uploaderId: uuid("uploader_id").references(() => users.id, { onDelete: "set null" }),
  originalFilename: text("original_filename").notNull(),
  mimeType: text("mime_type").notNull(),
  sizeBytes: integer("size_bytes").notNull(),
  dataBase64: text("data_base64").notNull(),
  status: photoStatusEnum("status").notNull().default("UPLOADED"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  caseIdx: index("photo_records_case_idx").on(table.caseId),
  uploaderIdx: index("photo_records_uploader_idx").on(table.uploaderId),
}));

export const photoAnalysis = pgTable("photo_analysis", {
  id: uuid("id").defaultRandom().primaryKey(),
  photoId: uuid("photo_id").notNull().references(() => photoRecords.id, { onDelete: "cascade" }),
  hasGps: boolean("has_gps").notNull().default(false),
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
  capturedAt: timestamp("captured_at", { withTimezone: true }),
  cameraMake: text("camera_make"),
  cameraModel: text("camera_model"),
  orientation: integer("orientation"),
  rawExif: jsonb("raw_exif"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  photoIdx: uniqueIndex("photo_analysis_photo_idx").on(table.photoId),
}));

// ============================================================
// CAMERA VERIFICATION
// ============================================================

export const cameraSessions = pgTable("camera_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  caseId: uuid("case_id").references(() => cases.id, { onDelete: "set null" }),
  trackingSessionId: uuid("tracking_session_id").references(() => trackingSessions.id, { onDelete: "set null" }),
  consentId: uuid("consent_id").references(() => consents.id, { onDelete: "set null" }),
  status: cameraStatusEnum("status").notNull().default("WAITING_PERMISSION"),
  startedAt: timestamp("started_at", { withTimezone: true }),
  endedAt: timestamp("ended_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  caseIdx: index("camera_sessions_case_idx").on(table.caseId),
  sessionIdx: index("camera_sessions_tracking_idx").on(table.trackingSessionId),
}));

export const cameraCaptures = pgTable("camera_captures", {
  id: uuid("id").defaultRandom().primaryKey(),
  cameraSessionId: uuid("camera_session_id").notNull().references(() => cameraSessions.id, { onDelete: "cascade" }),
  mimeType: text("mime_type").notNull(),
  dataBase64: text("data_base64").notNull(),
  capturedAt: timestamp("captured_at", { withTimezone: true }).notNull().defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  sessionIdx: index("camera_captures_session_idx").on(table.cameraSessionId),
}));

// ============================================================
// NOTIFICATIONS
// ============================================================

export const notifications = pgTable("notifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: notificationTypeEnum("type").notNull(),
  title: text("title").notNull(),
  body: text("body"),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  userIdx: index("notifications_user_idx").on(table.userId),
  createdIdx: index("notifications_created_idx").on(table.createdAt),
}));

// ============================================================
// AUDIT LOGS
// ============================================================

export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  actorId: uuid("actor_id").references(() => users.id, { onDelete: "set null" }),
  action: text("action").notNull(),
  targetType: text("target_type"),
  targetId: text("target_id"),
  ipHash: text("ip_hash"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  actorIdx: index("audit_logs_actor_idx").on(table.actorId),
  actionIdx: index("audit_logs_action_idx").on(table.action),
  createdIdx: index("audit_logs_created_idx").on(table.createdAt),
}));

// ============================================================
// PHONE INTELLIGENCE (normalization only — no fake tracking)
// ============================================================

export const phoneLookups = pgTable("phone_lookups", {
  id: uuid("id").defaultRandom().primaryKey(),
  requesterId: uuid("requester_id").notNull().references(() => users.id),
  rawInput: text("raw_input").notNull(),
  e164: text("e164"),
  countryCode: text("country_code"),
  isValid: boolean("is_valid").notNull().default(false),
  numberType: text("number_type"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  requesterIdx: index("phone_lookups_requester_idx").on(table.requesterId),
}));

// ============================================================
// EMAIL EVENTS (disclosed open/click tracking — not covert)
// ============================================================

export const emailTrackingSessions = pgTable("email_tracking_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  creatorId: uuid("creator_id").notNull().references(() => users.id),
  caseId: uuid("case_id").references(() => cases.id, { onDelete: "set null" }),
  targetEmail: text("target_email").notNull(),
  subject: text("subject"),
  pixelToken: text("pixel_token").notNull(),
  status: text("status").notNull().default("ACTIVE"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  pixelTokenUnique: uniqueIndex("email_tracking_pixel_token_unique").on(table.pixelToken),
  creatorIdx: index("email_tracking_creator_idx").on(table.creatorId),
}));

export const emailTrackingEvents = pgTable("email_tracking_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  sessionId: uuid("session_id").notNull().references(() => emailTrackingSessions.id, { onDelete: "cascade" }),
  status: emailEventStatusEnum("status").notNull().default("OPEN_SIGNAL"),
  occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull().defaultNow(),
  ipHash: text("ip_hash"),
  userAgent: text("user_agent"),
}, (table) => ({
  sessionIdx: index("email_tracking_events_session_idx").on(table.sessionId),
}));

// ============================================================
// SETTINGS
// ============================================================

export const systemSettings = pgTable("system_settings", {
  key: text("key").primaryKey(),
  value: jsonb("value").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

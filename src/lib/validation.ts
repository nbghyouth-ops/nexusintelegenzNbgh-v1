import { z } from "zod";

export const emailSchema = z.string().trim().toLowerCase().email().max(255);
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128);

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: emailSchema,
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1).max(128),
});

export const caseCreateSchema = z.object({
  title: z.string().trim().min(2).max(200),
  description: z.string().trim().max(5000).optional().nullable(),
});

export const caseUpdateSchema = z.object({
  title: z.string().trim().min(2).max(200).optional(),
  description: z.string().trim().max(5000).optional().nullable(),
  status: z.enum(["OPEN", "PROCESSING", "COMPLETED", "ARCHIVED", "CANCELLED"]).optional(),
});

export const trackingCreateSchema = z.object({
  label: z.string().trim().min(2).max(150),
  purpose: z.string().trim().min(2).max(1000),
  caseId: z.string().uuid().optional().nullable(),
  requiresLocation: z.boolean().default(true),
  requiresCamera: z.boolean().default(false),
  expiresInHours: z.number().int().min(1).max(24 * 30).default(72),
});

export const consentDecisionSchema = z.object({
  consentId: z.string().uuid(),
  decision: z.enum(["GRANTED", "DENIED"]),
});

export const locationSubmitSchema = z.object({
  token: z.string().min(10).max(200),
  consentId: z.string().uuid(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  accuracyMeters: z.number().min(0).max(10_000_000).optional().nullable(),
  capturedAt: z.string().datetime().optional(),
});

export const manualLocationSchema = z.object({
  caseId: z.string().uuid(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  note: z.string().trim().max(2000).optional(),
});

export const phoneLookupSchema = z.object({
  rawInput: z.string().trim().min(3).max(32),
  defaultCountry: z.string().length(2).optional(),
});

export const cameraCaptureSchema = z.object({
  token: z.string().min(10).max(200),
  cameraSessionId: z.string().uuid(),
  consentId: z.string().uuid(),
  mimeType: z.enum(["image/jpeg", "image/png", "image/webp"]),
  dataBase64: z.string().min(100).max(15_000_000),
});

export const photoUploadMetaSchema = z.object({
  caseId: z.string().uuid().optional().nullable(),
  mimeType: z.enum(["image/jpeg", "image/png", "image/webp", "image/heic"]),
  sizeBytes: z.number().int().min(1).max(20 * 1024 * 1024),
  originalFilename: z.string().trim().min(1).max(255),
});

export const emailTrackingCreateSchema = z.object({
  targetEmail: emailSchema,
  subject: z.string().trim().max(255).optional(),
  caseId: z.string().uuid().optional().nullable(),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

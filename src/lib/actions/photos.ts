"use server";

import { db } from "@/db";
import { photoRecords, photoAnalysis } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import { hasPermission } from "@/lib/auth/rbac";
import { logAudit } from "@/lib/audit";
import { extractExif } from "@/lib/exif";
import { detectImageMime } from "@/lib/file-validation";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

export type ActionResult = { error?: string };

const MAX_BYTES = 15 * 1024 * 1024;
const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function uploadPhotoAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { error: "AUTH_REQUIRED" };
  if (!hasPermission(user.role, "photos.create")) return { error: "FORBIDDEN" };

  const file = formData.get("file");
  if (!(file instanceof File)) return { error: "VALIDATION_ERROR" };
  if (file.size === 0 || file.size > MAX_BYTES) return { error: "UPLOAD_REJECTED" };
  if (!ALLOWED_MIME.has(file.type)) return { error: "UPLOAD_REJECTED" };

  const caseId = (formData.get("caseId") as string) || null;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const detectedMime = detectImageMime(buffer);
  if (!detectedMime) return { error: "UPLOAD_REJECTED" };

  const exif = await extractExif(buffer);

  const inserted = await db
    .insert(photoRecords)
    .values({
      caseId,
      uploaderId: user.id,
      originalFilename: file.name.slice(0, 255),
      mimeType: detectedMime,
      sizeBytes: buffer.length,
      dataBase64: buffer.toString("base64"),
      status: exif.hasGps ? "ANALYZED" : "NO_METADATA",
    })
    .returning({ id: photoRecords.id });

  const photoId = inserted[0]!.id;

  await db.insert(photoAnalysis).values({
    photoId,
    hasGps: exif.hasGps,
    latitude: exif.latitude,
    longitude: exif.longitude,
    capturedAt: exif.capturedAt,
    cameraMake: exif.cameraMake,
    cameraModel: exif.cameraModel,
    orientation: exif.orientation,
    rawExif: exif.raw,
  });

  await logAudit({ actorId: user.id, action: "PHOTO_UPLOADED", targetType: "photo", targetId: photoId });
  await logAudit({ actorId: user.id, action: "PHOTO_PROCESSED", targetType: "photo", targetId: photoId, metadata: { hasGps: exif.hasGps } });

  revalidatePath("/photos");
  redirect(`/photos/${photoId}`);
}

export async function deletePhotoAction(photoId: string): Promise<void> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!hasPermission(user.role, "photos.delete")) redirect(`/photos/${photoId}`);

  await db.delete(photoRecords).where(eq(photoRecords.id, photoId));
  await logAudit({ actorId: user.id, action: "PHOTO_DELETED", targetType: "photo", targetId: photoId });
  revalidatePath("/photos");
  redirect("/photos");
}

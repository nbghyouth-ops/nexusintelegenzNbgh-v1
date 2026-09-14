import type { Metadata } from "next";
import { db } from "@/db";
import { cases } from "@/db/schema";
import { desc } from "drizzle-orm";
import { Card, CardHeader } from "@/components/ui/card";
import { UploadForm } from "./upload-form";

export const metadata: Metadata = { title: "Upload Photo" };
export const dynamic = "force-dynamic";

export default async function UploadPhotoPage() {
  const availableCases = await db
    .select({ id: cases.id, caseNumber: cases.caseNumber, title: cases.title })
    .from(cases)
    .orderBy(desc(cases.createdAt))
    .limit(50);

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <p className="font-display text-xs uppercase tracking-widest text-accent">Evidence</p>
        <h1 className="mt-1 font-display text-2xl text-[color:var(--color-text)]">Upload Photo</h1>
        <p className="mt-2 text-sm text-[color:var(--color-text-dim)]">
          JPEG, PNG, or WEBP up to 15 MB. EXIF metadata (including GPS, if present) is extracted
          automatically. If no GPS metadata exists in the file, it is reported honestly as unavailable.
        </p>
      </div>
      <Card>
        <CardHeader title="Upload" />
        <UploadForm cases={availableCases} />
      </Card>
    </div>
  );
}

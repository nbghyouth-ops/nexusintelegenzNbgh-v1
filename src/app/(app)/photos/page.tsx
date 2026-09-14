import type { Metadata } from "next";
import { db } from "@/db";
import { photoRecords } from "@/db/schema";
import { desc, sql } from "drizzle-orm";
import { Card, CardHeader, EmptyState } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import { LinkButton } from "@/components/ui/button";
import Link from "next/link";

export const metadata: Metadata = { title: "Photos" };
export const dynamic = "force-dynamic";

const PAGE_SIZE = 24;

export default async function PhotosPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);

  const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(photoRecords);
  const rows = await db
    .select({
      id: photoRecords.id,
      mimeType: photoRecords.mimeType,
      dataBase64: photoRecords.dataBase64,
      status: photoRecords.status,
      createdAt: photoRecords.createdAt,
    })
    .from(photoRecords)
    .orderBy(desc(photoRecords.createdAt))
    .limit(PAGE_SIZE)
    .offset((page - 1) * PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-display text-xs uppercase tracking-widest text-accent">Evidence</p>
          <h1 className="mt-1 font-display text-2xl text-[color:var(--color-text)]">Photos</h1>
        </div>
        <LinkButton href="/photos/upload">+ Upload Photo</LinkButton>
      </div>

      <Card>
        <CardHeader title="Library" subtitle="EXIF metadata is extracted automatically when present" />
        {rows.length === 0 ? (
          <EmptyState title="No photos yet" description="Upload a photo to extract EXIF metadata, including GPS coordinates when available." action={<LinkButton href="/photos/upload">Upload Photo</LinkButton>} />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {rows.map((p) => (
              <Link key={p.id} href={`/photos/${p.id}`} className="group relative block overflow-hidden rounded-lg border border-[color:var(--color-panel-border)]">
                <img src={`data:${p.mimeType};base64,${p.dataBase64}`} alt="" loading="lazy" className="h-32 w-full object-cover transition group-hover:scale-105" />
                <div className="absolute bottom-1 left-1">
                  <StatusBadge status={p.status} />
                </div>
              </Link>
            ))}
          </div>
        )}
        <Pagination basePath="/photos" page={page} pageSize={PAGE_SIZE} total={count ?? 0} />
      </Card>
    </div>
  );
}

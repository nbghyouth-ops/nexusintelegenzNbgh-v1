import type { Metadata } from "next";
import { db } from "@/db";
import { cases, users } from "@/db/schema";
import { desc, eq, ilike, or, sql } from "drizzle-orm";
import { Card, CardHeader, EmptyState } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import { NewCaseForm } from "./new-case-form";
import Link from "next/link";

export const metadata: Metadata = { title: "Cases" };
export const dynamic = "force-dynamic";

const PAGE_SIZE = 15;

export default async function CasesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const q = sp.q?.trim();

  const whereClause = q
    ? or(ilike(cases.title, `%${q}%`), ilike(cases.caseNumber, `%${q}%`))
    : undefined;

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(cases)
    .where(whereClause);

  const rows = await db
    .select({
      id: cases.id,
      caseNumber: cases.caseNumber,
      title: cases.title,
      status: cases.status,
      createdAt: cases.createdAt,
      ownerName: users.name,
    })
    .from(cases)
    .innerJoin(users, eq(cases.ownerId, users.id))
    .where(whereClause)
    .orderBy(desc(cases.createdAt))
    .limit(PAGE_SIZE)
    .offset((page - 1) * PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div>
        <p className="font-display text-xs uppercase tracking-widest text-accent">Records</p>
        <h1 className="mt-1 font-display text-2xl text-[color:var(--color-text)]">Cases</h1>
      </div>

      <NewCaseForm />

      <Card>
        <CardHeader
          title="All Cases"
          action={
            <form className="flex gap-2">
              <input
                name="q"
                defaultValue={q}
                placeholder="Search case # or title"
                className="rounded-full border border-[color:var(--color-panel-border)] bg-black/30 px-3 py-1.5 text-xs outline-none focus:border-accent"
              />
            </form>
          }
        />
        {rows.length === 0 ? (
          <EmptyState title="No cases found" description="Create a case to begin collecting consent-based evidence." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[color:var(--color-panel-border)] text-[10px] uppercase tracking-wide text-[color:var(--color-text-dim)]">
                  <th className="pb-2">Case #</th>
                  <th className="pb-2">Title</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2">Owner</th>
                  <th className="pb-2">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[color:var(--color-panel-border)]">
                {rows.map((c) => (
                  <tr key={c.id} className="hover:bg-white/[0.02]">
                    <td className="py-3">
                      <Link href={`/cases/${c.id}`} className="font-display text-accent hover:underline">
                        {c.caseNumber}
                      </Link>
                    </td>
                    <td className="py-3">{c.title}</td>
                    <td className="py-3">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="py-3 text-[color:var(--color-text-dim)]">{c.ownerName}</td>
                    <td className="py-3 text-[color:var(--color-text-dim)]">{new Date(c.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination basePath="/cases" page={page} pageSize={PAGE_SIZE} total={count ?? 0} />
      </Card>
    </div>
  );
}

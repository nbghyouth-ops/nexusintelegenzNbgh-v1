import Link from "next/link";

export function Pagination({
  basePath,
  page,
  pageSize,
  total,
}: {
  basePath: string;
  page: number;
  pageSize: number;
  total: number;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;

  return (
    <div className="mt-4 flex items-center justify-between text-xs text-[color:var(--color-text-dim)]">
      <span>
        Page {page} of {totalPages} · {total} total
      </span>
      <div className="flex gap-2">
        <Link
          aria-disabled={page <= 1}
          href={`${basePath}?page=${Math.max(1, page - 1)}`}
          className={`rounded-full border border-[color:var(--color-panel-border)] px-3 py-1 ${page <= 1 ? "pointer-events-none opacity-30" : "hover:border-accent hover:text-accent"}`}
        >
          Prev
        </Link>
        <Link
          aria-disabled={page >= totalPages}
          href={`${basePath}?page=${Math.min(totalPages, page + 1)}`}
          className={`rounded-full border border-[color:var(--color-panel-border)] px-3 py-1 ${page >= totalPages ? "pointer-events-none opacity-30" : "hover:border-accent hover:text-accent"}`}
        >
          Next
        </Link>
      </div>
    </div>
  );
}

import { logoutAction } from "@/lib/actions/auth";
import type { CurrentUser } from "@/lib/auth/session";

export function Topbar({ user }: { user: CurrentUser }) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-[color:var(--color-panel-border)] bg-[color:var(--color-bg)]/90 px-4 py-3 backdrop-blur lg:px-8">
      <div className="flex items-center gap-2 lg:hidden">
        <span className="flex h-7 w-7 items-center justify-center rounded-md border border-accent text-xs text-accent">◆</span>
        <p className="font-display text-xs text-accent">HELIX_OPS</p>
      </div>
      <div className="hidden text-xs text-[color:var(--color-text-dim)] lg:block">
        Consent-aware evidence &amp; tracking operations console
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right leading-tight">
          <p className="text-sm text-[color:var(--color-text)]">{user.name}</p>
          <p className="text-[10px] uppercase tracking-wide text-accent">{user.role.replace("_", " ")}</p>
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="rounded-full border border-red-800/50 bg-red-500/10 px-3 py-1.5 font-display text-[10px] uppercase tracking-wide text-red-300 hover:bg-red-500/20"
          >
            Logout
          </button>
        </form>
      </div>
    </header>
  );
}

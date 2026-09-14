"use client";

import { useTransition } from "react";
import { markNotificationReadAction } from "@/lib/actions/notifications";
import { Badge } from "@/components/ui/badge";

type Notification = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  isRead: boolean;
  createdAt: Date;
};

export function NotificationRow({ notification }: { notification: Notification }) {
  const [pending, startTransition] = useTransition();
  return (
    <li className={`flex items-start justify-between gap-3 py-3 ${notification.isRead ? "opacity-60" : ""}`}>
      <div>
        <div className="flex items-center gap-2">
          <Badge tone={notification.isRead ? "neutral" : "accent"}>{notification.type.replace(/_/g, " ")}</Badge>
        </div>
        <p className="mt-1 text-sm text-[color:var(--color-text)]">{notification.title}</p>
        {notification.body ? <p className="text-xs text-[color:var(--color-text-dim)]">{notification.body}</p> : null}
        <p className="mt-1 text-[10px] text-[color:var(--color-text-dim)]">{new Date(notification.createdAt).toLocaleString()}</p>
      </div>
      {!notification.isRead ? (
        <button
          disabled={pending}
          onClick={() => startTransition(() => markNotificationReadAction(notification.id))}
          className="shrink-0 rounded-full border border-white/10 px-3 py-1 text-[10px] uppercase tracking-wide text-[color:var(--color-text-dim)] hover:border-accent hover:text-accent"
        >
          Mark read
        </button>
      ) : null}
    </li>
  );
}

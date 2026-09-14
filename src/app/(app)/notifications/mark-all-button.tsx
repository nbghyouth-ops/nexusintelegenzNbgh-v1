"use client";

import { useTransition } from "react";
import { markAllNotificationsReadAction } from "@/lib/actions/notifications";
import { Button } from "@/components/ui/button";

export function MarkAllButton() {
  const [pending, startTransition] = useTransition();
  return (
    <Button variant="secondary" disabled={pending} onClick={() => startTransition(() => markAllNotificationsReadAction())}>
      {pending ? "Marking…" : "Mark all read"}
    </Button>
  );
}

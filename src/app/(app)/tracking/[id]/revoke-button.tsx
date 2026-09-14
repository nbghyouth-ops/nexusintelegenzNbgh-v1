"use client";

import { useTransition } from "react";
import { revokeTrackingSessionAction } from "@/lib/actions/tracking";
import { Button } from "@/components/ui/button";

export function RevokeButton({ sessionId }: { sessionId: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <Button
      variant="danger"
      disabled={pending}
      onClick={() => {
        if (confirm("Revoke this tracking session? It can no longer receive visits or evidence.")) {
          startTransition(() => revokeTrackingSessionAction(sessionId));
        }
      }}
    >
      {pending ? "Revoking…" : "Revoke"}
    </Button>
  );
}

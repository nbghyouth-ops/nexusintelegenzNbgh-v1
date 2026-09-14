"use client";

import { useTransition } from "react";
import { deletePhotoAction } from "@/lib/actions/photos";
import { Button } from "@/components/ui/button";

export function DeletePhotoButton({ photoId }: { photoId: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <Button
      variant="danger"
      disabled={pending}
      onClick={() => {
        if (confirm("Delete this photo permanently?")) startTransition(() => deletePhotoAction(photoId));
      }}
    >
      {pending ? "Deleting…" : "Delete Photo"}
    </Button>
  );
}

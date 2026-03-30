"use client";

import { useTransition } from "react";
import { deleteEvent } from "@/app/actions";

export function DeleteEventButton({ eventId }: { eventId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      disabled={isPending}
      onClick={() => {
        if (!confirm("Delete this event?")) return;
        startTransition(async () => {
          await deleteEvent(eventId);
        });
      }}
      className="text-sm text-not-going hover:text-not-going/80 transition-colors disabled:opacity-50"
    >
      {isPending ? "Deleting..." : "Delete event"}
    </button>
  );
}

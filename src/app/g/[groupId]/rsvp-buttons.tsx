"use client";

import { useOptimistic, useTransition } from "react";
import { rsvpToEvent } from "@/app/actions";

const statuses = [
  { value: "going", label: "Going", color: "bg-going/20 text-going border-going/40 shadow-sm shadow-going/10" },
  { value: "maybe", label: "Maybe", color: "bg-maybe/20 text-maybe border-maybe/40 shadow-sm shadow-maybe/10" },
  { value: "not_going", label: "Can't", color: "bg-not-going/20 text-not-going border-not-going/40 shadow-sm shadow-not-going/10" },
];

export function RsvpButtons({
  eventId,
  currentStatus,
}: {
  eventId: string;
  currentStatus: string | null;
}) {
  const [optimisticStatus, setOptimisticStatus] = useOptimistic(currentStatus);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex gap-2">
      {statuses.map((s) => {
        const isActive = optimisticStatus === s.value;
        return (
          <button
            key={s.value}
            disabled={isPending}
            onClick={() => {
              startTransition(async () => {
                setOptimisticStatus(s.value);
                await rsvpToEvent(eventId, s.value);
              });
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl border-2 transition-all ${
              isActive
                ? s.color
                : "border-card-border text-foreground/40 hover:border-foreground/20 hover:text-foreground/60"
            } disabled:opacity-50`}
          >
            {s.label}
          </button>
        );
      })}
    </div>
  );
}

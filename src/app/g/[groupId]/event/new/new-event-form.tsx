"use client";

import { useActionState, useRef } from "react";
import { createEvent } from "@/app/actions";

function localToISO(localDatetime: string): string {
  // datetime-local gives "2026-04-15T12:00" — no timezone
  // new Date() interprets it as local time and toISOString() converts to UTC
  if (!localDatetime) return "";
  return new Date(localDatetime).toISOString();
}

export function NewEventForm() {
  const [state, formAction, pending] = useActionState(createEvent, null);
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(formData: FormData) {
    // Convert local datetime inputs to proper UTC ISO strings
    const startLocal = formData.get("startTimeLocal") as string;
    const endLocal = formData.get("endTimeLocal") as string;

    formData.set("startTime", localToISO(startLocal));
    if (endLocal) {
      formData.set("endTime", localToISO(endLocal));
    }

    return formAction(formData);
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm text-foreground/50 font-semibold mb-1">
          What&apos;s happening?
        </label>
        <input
          name="title"
          placeholder="e.g. Game Night, Beach Day, Dinner..."
          required
          className="w-full px-4 py-3 bg-background border border-card-border rounded-xl text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-accent"
        />
      </div>

      <div>
        <label className="block text-sm text-foreground/50 font-semibold mb-1">
          Details (optional)
        </label>
        <textarea
          name="description"
          placeholder="Any extra info..."
          rows={3}
          className="w-full px-4 py-3 bg-background border border-card-border rounded-xl text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-accent resize-none"
        />
      </div>

      <div>
        <label className="block text-sm text-foreground/50 font-semibold mb-1">
          Where?
        </label>
        <input
          name="location"
          placeholder="e.g. Jake's place, Central Park..."
          className="w-full px-4 py-3 bg-background border border-card-border rounded-xl text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-accent"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm text-foreground/50 font-semibold mb-1">
            Start
          </label>
          <input
            name="startTimeLocal"
            type="datetime-local"
            required
            className="w-full px-4 py-3 bg-background border border-card-border rounded-xl text-foreground focus:outline-none focus:border-accent"
          />
        </div>
        <div>
          <label className="block text-sm text-foreground/50 font-semibold mb-1">
            End (optional)
          </label>
          <input
            name="endTimeLocal"
            type="datetime-local"
            className="w-full px-4 py-3 bg-background border border-card-border rounded-xl text-foreground focus:outline-none focus:border-accent"
          />
        </div>
      </div>

      {/* Hidden fields for the converted UTC values */}
      <input type="hidden" name="startTime" />
      <input type="hidden" name="endTime" />

      {state?.error && (
        <p className="text-not-going text-sm">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full py-3 bg-accent hover:bg-accent-light text-white font-bold rounded-xl transition-colors disabled:opacity-50 shadow-md shadow-accent/20"
      >
        {pending ? "Creating..." : "Create Event"}
      </button>
    </form>
  );
}

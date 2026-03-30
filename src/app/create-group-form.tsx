"use client";

import { useActionState } from "react";
import { createGroup } from "./actions";

export function CreateGroupForm() {
  const [state, formAction, pending] = useActionState(createGroup, null);

  return (
    <form action={formAction} className="space-y-3">
      <input
        name="name"
        placeholder="Group name (e.g. PDA, The Squad...)"
        required
        className="w-full px-4 py-3 bg-background border border-card-border rounded-xl text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-accent"
      />
      <input
        name="displayName"
        placeholder="Your name"
        required
        className="w-full px-4 py-3 bg-background border border-card-border rounded-xl text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-accent"
      />
      {state?.error && (
        <p className="text-not-going text-sm">{state.error}</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="w-full py-3 bg-accent hover:bg-accent-light text-white font-semibold rounded-xl transition-colors disabled:opacity-50"
      >
        {pending ? "Creating..." : "Let's Go!"}
      </button>
    </form>
  );
}

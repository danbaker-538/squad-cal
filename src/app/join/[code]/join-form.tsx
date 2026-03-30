"use client";

import { useActionState } from "react";
import { joinGroup } from "@/app/actions";

export function JoinForm({ code }: { code: string }) {
  const [state, formAction, pending] = useActionState(joinGroup, null);

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="code" value={code} />
      <input
        name="displayName"
        placeholder="What should we call you?"
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
        {pending ? "Joining..." : "I'm In!"}
      </button>
    </form>
  );
}

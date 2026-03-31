"use client";

import { useActionState } from "react";
import { loginWithCode } from "./actions";

export function LoginWithCodeForm() {
  const [state, formAction, pending] = useActionState(loginWithCode, null);

  return (
    <form action={formAction} className="flex gap-2">
      <input
        name="code"
        placeholder="PDA-XXXX"
        required
        className="flex-1 px-4 py-3 bg-background border border-card-border rounded-xl text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-accent uppercase tracking-wider font-mono font-bold"
      />
      <button
        type="submit"
        disabled={pending}
        className="px-5 py-3 bg-accent hover:bg-accent-light text-white font-bold rounded-xl transition-colors disabled:opacity-50 shadow-md shadow-accent/20"
      >
        {pending ? "..." : "Go"}
      </button>
      {state?.error && (
        <p className="text-not-going text-sm absolute mt-14">{state.error}</p>
      )}
    </form>
  );
}

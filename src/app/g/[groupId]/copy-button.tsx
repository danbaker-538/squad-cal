"use client";

import { useState } from "react";

export function CopyButton({ path }: { path: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      className="text-xs px-3 py-1.5 bg-accent/10 text-accent font-semibold rounded-lg hover:bg-accent/20 transition-colors shrink-0"
      onClick={() => {
        const url = `${window.location.origin}${path}`;
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

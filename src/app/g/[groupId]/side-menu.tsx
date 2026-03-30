"use client";

import { useState, useTransition } from "react";
import { switchGroup } from "@/app/actions";

interface GroupInfo {
  id: string;
  group_id: string;
  display_name: string;
  groups: { id: string; name: string }[] | { id: string; name: string } | null;
}

interface MemberInfo {
  id: string;
  display_name: string;
  xp: number;
}

export function SideMenu({
  inviteUrl,
  currentGroupId,
  currentGroupName,
  myGroups,
  members,
}: {
  inviteUrl: string;
  currentGroupId: string;
  currentGroupName: string;
  myGroups: GroupInfo[];
  members: MemberInfo[];
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();

  const otherGroups = myGroups.filter((g) => g.group_id !== currentGroupId);

  const getGroupName = (g: GroupInfo) => {
    if (!g.groups) return "Unknown";
    if (Array.isArray(g.groups)) return g.groups[0]?.name ?? "Unknown";
    return g.groups.name;
  };

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={() => setOpen(true)}
        className="p-2 rounded-xl hover:bg-card-border/40 transition-colors"
        aria-label="Menu"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Slide-out Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-background z-50 shadow-2xl transform transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full p-5 overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-extrabold">{currentGroupName}</h2>
            <button
              onClick={() => setOpen(false)}
              className="p-1.5 rounded-lg hover:bg-card-border/40 transition-colors text-foreground/50"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Invite Link */}
          <div className="mb-6">
            <p className="text-xs font-semibold text-foreground/40 uppercase tracking-wider mb-2">Invite Friends</p>
            <div className="card-spring p-3 flex items-center justify-between gap-2">
              <code className="text-sm text-accent font-semibold truncate">{inviteUrl}</code>
              <button
                onClick={() => {
                  const url = `${window.location.origin}${inviteUrl}`;
                  navigator.clipboard.writeText(url);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="text-xs px-3 py-1.5 bg-accent/10 text-accent font-semibold rounded-lg hover:bg-accent/20 transition-colors shrink-0"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>

          {/* Members */}
          <div className="mb-6">
            <p className="text-xs font-semibold text-foreground/40 uppercase tracking-wider mb-2">
              Members ({members.length})
            </p>
            <div className="space-y-1">
              {members.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-card-border/20"
                >
                  <span className="font-semibold text-sm">{m.display_name}</span>
                  <span className="text-xs gradient-text font-bold">{m.xp} XP</span>
                </div>
              ))}
            </div>
          </div>

          {/* Group Switcher */}
          <div className="mb-6">
            <p className="text-xs font-semibold text-foreground/40 uppercase tracking-wider mb-2">Your Groups</p>
            <div className="space-y-1">
              {/* Current group */}
              <div className="flex items-center gap-2 py-2 px-3 rounded-xl bg-accent/10">
                <div className="w-2 h-2 rounded-full bg-accent" />
                <span className="font-bold text-sm">{currentGroupName}</span>
                <span className="text-xs text-foreground/40 ml-auto">current</span>
              </div>

              {/* Other groups */}
              {otherGroups.map((g) => (
                <button
                  key={g.id}
                  disabled={isPending}
                  onClick={() => {
                    startTransition(async () => {
                      await switchGroup(g.id, g.group_id);
                    });
                  }}
                  className="w-full flex items-center gap-2 py-2 px-3 rounded-xl hover:bg-card-border/30 transition-colors text-left disabled:opacity-50"
                >
                  <div className="w-2 h-2 rounded-full bg-card-border" />
                  <span className="font-semibold text-sm">{getGroupName(g)}</span>
                </button>
              ))}

              {/* Create new group */}
              <a
                href="/?new"
                className="flex items-center gap-2 py-2 px-3 rounded-xl hover:bg-card-border/30 transition-colors text-accent font-semibold text-sm"
              >
                <span className="text-lg leading-none">+</span>
                <span>New Group</span>
              </a>
            </div>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Footer */}
          <div className="text-center text-xs text-foreground/30 font-semibold">
            PD<span className="gradient-text">c</span>Alendar &middot; Spring 2026
          </div>
        </div>
      </div>
    </>
  );
}

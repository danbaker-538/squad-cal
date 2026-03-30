"use client";

import { useState } from "react";
import Link from "next/link";
import { RsvpButtons } from "./rsvp-buttons";
import { CalendarGrid } from "./calendar-grid";

export interface EventData {
  id: string;
  title: string;
  description?: string;
  location?: string;
  start_time: string;
  end_time?: string;
  created_by?: string;
  rsvps?: Array<{ status: string; member_id: string }>;
  created_by_member?: { display_name: string } | null;
}

export function EventViews({
  events,
  groupId,
  memberId,
}: {
  events: EventData[];
  groupId: string;
  memberId: string;
}) {
  const [view, setView] = useState<"list" | "calendar">("list");

  // For the list view, only show upcoming events
  const now = new Date();
  const upcomingEvents = events.filter(
    (e) => new Date(e.start_time) >= now
  );

  return (
    <div className="space-y-4">
      {/* View Toggle */}
      <div className="flex items-center gap-1 card-spring p-1">
        <button
          onClick={() => setView("list")}
          className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
            view === "list"
              ? "bg-accent text-white shadow-sm"
              : "text-foreground/50 hover:text-foreground/70"
          }`}
        >
          Upcoming
        </button>
        <button
          onClick={() => setView("calendar")}
          className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
            view === "calendar"
              ? "bg-accent text-white shadow-sm"
              : "text-foreground/50 hover:text-foreground/70"
          }`}
        >
          Calendar
        </button>
      </div>

      {view === "calendar" ? (
        <CalendarGrid events={events} groupId={groupId} />
      ) : (
        <>
          {upcomingEvents.length === 0 ? (
            <div className="card-spring p-8 text-center text-foreground/50">
              <p className="text-lg mb-2">No events yet</p>
              <p className="text-sm">Be the first to plan something!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingEvents.map((event) => {
                const start = new Date(event.start_time);
                const goingCount =
                  event.rsvps?.filter((r) => r.status === "going").length ?? 0;
                const myRsvp = event.rsvps?.find(
                  (r) => r.member_id === memberId
                );

                return (
                  <div
                    key={event.id}
                    className="card-spring p-4 space-y-3"
                  >
                    <Link
                      href={`/g/${groupId}/event/${event.id}`}
                      className="block"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-lg">{event.title}</h3>
                          {event.location && (
                            <p className="text-sm text-foreground/50">
                              {event.location}
                            </p>
                          )}
                        </div>
                        <div className="text-right text-sm">
                          <p className="text-accent font-bold">
                            {start.toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                            })}
                          </p>
                          <p className="text-foreground/50">
                            {start.toLocaleTimeString("en-US", {
                              hour: "numeric",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-foreground/40 mt-1">
                        <span>
                          by{" "}
                          {event.created_by_member?.display_name ?? "Unknown"}
                        </span>
                        <span>&middot;</span>
                        <span className="text-going font-semibold">
                          {goingCount} going
                        </span>
                      </div>
                    </Link>
                    <RsvpButtons
                      eventId={event.id}
                      currentStatus={myRsvp?.status ?? null}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}

import { createClient } from "@/lib/supabase-server";
import { getMemberId, getGroupId } from "@/lib/member";
import { redirect } from "next/navigation";
import { RsvpButtons } from "../../rsvp-buttons";
import { DeleteEventButton } from "./delete-event-button";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ groupId: string; eventId: string }>;
}) {
  const { groupId, eventId } = await params;
  const memberId = await getMemberId();
  const cookieGroupId = await getGroupId();

  if (!memberId || cookieGroupId !== groupId) {
    redirect("/");
  }

  const supabase = await createClient();

  const [{ data: event }, { data: rsvps }] = await Promise.all([
    supabase
      .from("events")
      .select("*, created_by_member:members!created_by(display_name)")
      .eq("id", eventId)
      .single(),
    supabase
      .from("rsvps")
      .select("*, member:members(display_name)")
      .eq("event_id", eventId),
  ]);

  if (!event) {
    redirect(`/g/${groupId}`);
  }

  const start = new Date(event.start_time);
  const end = event.end_time ? new Date(event.end_time) : null;
  const myRsvp = rsvps?.find(
    (r: { member_id: string }) => r.member_id === memberId
  );
  const isCreator = event.created_by === memberId;

  const goingList = rsvps?.filter((r: { status: string }) => r.status === "going") ?? [];
  const maybeList = rsvps?.filter((r: { status: string }) => r.status === "maybe") ?? [];

  return (
    <main className="flex-1 flex flex-col max-w-lg mx-auto w-full p-4 pb-8">
      <a
        href={`/g/${groupId}`}
        className="text-accent hover:underline text-sm mb-4 font-semibold"
      >
        &larr; Back to calendar
      </a>

      <div className="card-spring p-6 space-y-5">
        <div>
          <h1 className="text-2xl font-extrabold">{event.title}</h1>
          <p className="text-sm text-foreground/40 mt-1">
            by {event.created_by_member?.display_name ?? "Unknown"}
          </p>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-3">
            <span className="text-foreground/40 w-14 font-semibold">When</span>
            <span className="font-medium">
              {start.toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}{" "}
              at{" "}
              {start.toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
              })}
              {end && (
                <>
                  {" "}
                  &ndash;{" "}
                  {end.toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </>
              )}
            </span>
          </div>
          {event.location && (
            <div className="flex items-center gap-3">
              <span className="text-foreground/40 w-14 font-semibold">Where</span>
              <span className="font-medium">{event.location}</span>
            </div>
          )}
        </div>

        {event.description && (
          <p className="text-foreground/60 text-sm whitespace-pre-wrap bg-gradient-start/20 rounded-xl p-3">
            {event.description}
          </p>
        )}

        <div className="border-t border-card-border pt-4">
          <p className="text-sm text-foreground/50 font-semibold mb-2">Your RSVP</p>
          <RsvpButtons eventId={eventId} currentStatus={myRsvp?.status ?? null} />
        </div>

        {/* RSVP lists */}
        {goingList.length > 0 && (
          <div>
            <p className="text-sm font-bold text-going mb-2">
              Going ({goingList.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {goingList.map((r: { id: string; member: { display_name: string } | null }) => (
                <span
                  key={r.id}
                  className="text-xs px-3 py-1.5 bg-going/10 text-going font-semibold rounded-full"
                >
                  {r.member?.display_name}
                </span>
              ))}
            </div>
          </div>
        )}

        {maybeList.length > 0 && (
          <div>
            <p className="text-sm font-bold text-maybe mb-2">
              Maybe ({maybeList.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {maybeList.map((r: { id: string; member: { display_name: string } | null }) => (
                <span
                  key={r.id}
                  className="text-xs px-3 py-1.5 bg-maybe/10 text-maybe font-semibold rounded-full"
                >
                  {r.member?.display_name}
                </span>
              ))}
            </div>
          </div>
        )}

        {isCreator && (
          <div className="border-t border-card-border pt-4">
            <DeleteEventButton eventId={eventId} />
          </div>
        )}
      </div>
    </main>
  );
}

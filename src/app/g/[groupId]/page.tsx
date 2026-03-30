import { createClient } from "@/lib/supabase-server";
import { getMemberId, getGroupId } from "@/lib/member";
import { redirect } from "next/navigation";
import { getLevel, getXpForNextLevel } from "@/lib/xp";
import Link from "next/link";
import { PdaLogo } from "@/app/components/pda-logo";
import { EventViews } from "./event-views";
import { SideMenu } from "./side-menu";
import { getMyGroups } from "@/app/actions";

export default async function GroupPage({
  params,
}: {
  params: Promise<{ groupId: string }>;
}) {
  const { groupId } = await params;
  const memberId = await getMemberId();
  const cookieGroupId = await getGroupId();

  if (!memberId || cookieGroupId !== groupId) {
    redirect("/");
  }

  const supabase = await createClient();

  // Fetch events from 1 month ago to 3 months ahead for calendar view
  const now = new Date();
  const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const threeMonthsAhead = new Date(now.getFullYear(), now.getMonth() + 4, 0);

  const [
    { data: group },
    { data: member },
    { data: events },
    { data: members },
    myGroups,
  ] = await Promise.all([
    supabase.from("groups").select("*").eq("id", groupId).single(),
    supabase.from("members").select("*").eq("id", memberId).single(),
    supabase
      .from("events")
      .select("*, rsvps(*), created_by_member:members!created_by(display_name)")
      .eq("group_id", groupId)
      .gte("start_time", monthAgo.toISOString())
      .lte("start_time", threeMonthsAhead.toISOString())
      .order("start_time", { ascending: true })
      .limit(100),
    supabase
      .from("members")
      .select("*")
      .eq("group_id", groupId)
      .order("xp", { ascending: false }),
    getMyGroups(),
  ]);

  if (!group || !member) {
    redirect("/");
  }

  const level = getLevel(member.xp);
  const progress = getXpForNextLevel(member.xp);
  const inviteUrl = `/join/${group.invite_code}`;

  return (
    <main className="flex-1 flex flex-col max-w-lg mx-auto w-full p-4 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <PdaLogo size="sm" />
          <div>
            <h1 className="text-xl font-extrabold">{group.name}</h1>
            <p className="text-xs text-foreground/50">
              {members?.length ?? 0} member{members?.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="gradient-text font-extrabold text-sm">Lvl {level}</p>
            <p className="text-xs text-foreground/50">{member.xp} XP</p>
            <div className="w-16 h-2 bg-card-border rounded-full mt-1 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-accent to-warm-orange rounded-full transition-all"
                style={{ width: `${progress.progress}%` }}
              />
            </div>
          </div>
          <SideMenu
            inviteUrl={inviteUrl}
            currentGroupId={groupId}
            currentGroupName={group.name}
            myGroups={myGroups}
            members={(members ?? []).map((m) => ({
              id: m.id,
              display_name: m.display_name,
              xp: m.xp,
            }))}
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3 mb-5">
        <Link
          href={`/g/${groupId}/event/new`}
          className="flex-1 py-3 bg-accent hover:bg-accent-light text-white font-bold rounded-xl text-center transition-colors shadow-md shadow-accent/20"
        >
          + New Event
        </Link>
        <Link
          href={`/g/${groupId}/leaderboard`}
          className="py-3 px-4 card-spring hover:border-accent/50 text-center transition-colors font-semibold"
        >
          Leaderboard
        </Link>
      </div>

      {/* Events — List + Calendar toggle */}
      <EventViews
        events={events ?? []}
        groupId={groupId}
        memberId={memberId}
      />
    </main>
  );
}

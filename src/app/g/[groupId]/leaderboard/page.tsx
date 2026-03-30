import { createClient } from "@/lib/supabase-server";
import { getMemberId, getGroupId } from "@/lib/member";
import { redirect } from "next/navigation";
import { getLevel, getXpForNextLevel } from "@/lib/xp";

export default async function LeaderboardPage({
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

  const { data: members } = await supabase
    .from("members")
    .select("*")
    .eq("group_id", groupId)
    .order("xp", { ascending: false });

  const medals = ["\u{1F947}", "\u{1F948}", "\u{1F949}"];

  return (
    <main className="flex-1 flex flex-col max-w-lg mx-auto w-full p-4 pb-8">
      <a
        href={`/g/${groupId}`}
        className="text-accent hover:underline text-sm mb-4 font-semibold"
      >
        &larr; Back to calendar
      </a>

      <h1 className="text-2xl font-extrabold mb-6">Leaderboard</h1>

      <div className="space-y-2">
        {members?.map((m, i) => {
          const level = getLevel(m.xp);
          const progress = getXpForNextLevel(m.xp);
          const isMe = m.id === memberId;

          return (
            <div
              key={m.id}
              className={`flex items-center gap-3 p-4 rounded-2xl transition-all ${
                isMe
                  ? "card-spring ring-2 ring-accent/30 shadow-md shadow-accent/10"
                  : "card-spring"
              }`}
            >
              <div className="text-2xl w-8 text-center">
                {i < 3 ? medals[i] : <span className="text-sm text-foreground/40 font-bold">#{i + 1}</span>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold truncate">
                    {m.display_name}
                  </span>
                  {isMe && (
                    <span className="text-xs text-accent font-semibold">(you)</span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs gradient-text font-bold">
                    Lvl {level}
                  </span>
                  <div className="flex-1 h-2 bg-card-border rounded-full max-w-24 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-accent to-warm-orange rounded-full"
                      style={{ width: `${progress.progress}%` }}
                    />
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="font-extrabold gradient-text">{m.xp}</p>
                <p className="text-xs text-foreground/40 font-semibold">XP</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 card-spring p-5">
        <h2 className="font-bold mb-3">How to earn XP</h2>
        <div className="space-y-2 text-sm text-foreground/60">
          <p>
            <span className="gradient-text font-bold">+10 XP</span>{" "}
            &mdash; Create an event
          </p>
          <p>
            <span className="gradient-text font-bold">+5 XP</span>{" "}
            &mdash; RSVP to an event
          </p>
          <p>
            <span className="gradient-text font-bold">+20 XP</span>{" "}
            &mdash; Attend an event
          </p>
        </div>
      </div>
    </main>
  );
}

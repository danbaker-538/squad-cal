import { createClient } from "@/lib/supabase-server";
import { JoinForm } from "./join-form";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}): Promise<Metadata> {
  const { code } = await params;
  const supabase = await createClient();
  const { data: group } = await supabase
    .from("groups")
    .select("name")
    .eq("invite_code", code.toLowerCase())
    .single();

  const name = group?.name ?? "a group";
  return {
    title: `Join ${name} — PDcAlendar`,
    description: `You've been invited to ${name}! Tap to join the squad on PDcAlendar 🌸`,
  };
}

export default async function JoinPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const supabase = await createClient();

  const { data: group } = await supabase
    .from("groups")
    .select("id, name")
    .eq("invite_code", code.toLowerCase())
    .single();

  if (!group) {
    return (
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-not-going">Invalid Invite</h1>
          <p className="text-foreground/60">
            This invite link doesn&apos;t exist or has expired.
          </p>
          <a href="/" className="text-accent-light hover:underline">
            Go home
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-accent-light">
            Join {group.name}
          </h1>
          <p className="mt-2 text-foreground/50">
            You&apos;ve been invited to the party!
          </p>
        </div>

        <div className="card-spring p-6">
          <JoinForm code={code} />
        </div>
      </div>
    </main>
  );
}

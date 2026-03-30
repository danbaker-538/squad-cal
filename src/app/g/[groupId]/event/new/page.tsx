import { getMemberId, getGroupId } from "@/lib/member";
import { redirect } from "next/navigation";
import { NewEventForm } from "./new-event-form";

export default async function NewEventPage({
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

  return (
    <main className="flex-1 flex flex-col max-w-lg mx-auto w-full p-4 pb-8">
      <a
        href={`/g/${groupId}`}
        className="text-accent hover:underline text-sm mb-4 font-semibold"
      >
        &larr; Back to calendar
      </a>
      <h1 className="text-2xl font-extrabold mb-6">Plan Something Fun</h1>
      <div className="card-spring p-6">
        <NewEventForm />
      </div>
    </main>
  );
}

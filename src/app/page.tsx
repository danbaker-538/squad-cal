import { getMemberId, getGroupId } from "@/lib/member";
import { redirect } from "next/navigation";
import { CreateGroupForm } from "./create-group-form";
import { PdaLogo } from "./components/pda-logo";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const isNewGroup = params.new !== undefined;

  const memberId = await getMemberId();
  const groupId = await getGroupId();

  // Only auto-redirect if not explicitly creating a new group
  if (memberId && groupId && !isNewGroup) {
    redirect(`/g/${groupId}`);
  }

  return (
    <main className="flex-1 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <PdaLogo size="lg" />
        </div>

        <div className="card-spring p-6 space-y-6">
          <div>
            <h2 className="text-lg font-bold mb-4">
              {isNewGroup ? "Create a new group" : "Start planning"}
            </h2>
            <CreateGroupForm />
          </div>

          {!isNewGroup && (
            <div className="border-t border-card-border pt-6">
              <h2 className="text-lg font-bold mb-2">Have an invite link?</h2>
              <p className="text-sm text-foreground/50">
                Just open the link your friend sent you and you&apos;re in.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

import { cookies } from "next/headers";

const MEMBER_COOKIE = "squad_member_id";
const GROUP_COOKIE = "squad_group_id";
const KNOWN_MEMBERS_COOKIE = "squad_known_members";

export async function getMemberId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(MEMBER_COOKIE)?.value ?? null;
}

export async function getGroupId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(GROUP_COOKIE)?.value ?? null;
}

export async function getKnownMemberIds(): Promise<string[]> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(KNOWN_MEMBERS_COOKIE)?.value;
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export async function setMemberCookies(memberId: string, groupId: string) {
  const cookieStore = await cookies();
  const opts = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: 60 * 60 * 24 * 365, // 1 year
    path: "/",
  };
  cookieStore.set(MEMBER_COOKIE, memberId, opts);
  cookieStore.set(GROUP_COOKIE, groupId, opts);

  // Track all known member IDs for this browser
  const known = await getKnownMemberIds();
  if (!known.includes(memberId)) {
    known.push(memberId);
  }
  cookieStore.set(KNOWN_MEMBERS_COOKIE, JSON.stringify(known), opts);
}

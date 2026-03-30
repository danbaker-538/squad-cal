"use server";

import { createClient } from "@/lib/supabase-server";
import { getMemberId, getGroupId, getKnownMemberIds, setMemberCookies } from "@/lib/member";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { XP_REWARDS } from "@/lib/xp";

function generateInviteCode(): string {
  const chars = "abcdefghjkmnpqrstuvwxyz23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// ---- Group Actions ----

export async function createGroup(_prevState: { error: string } | null, formData: FormData) {
  const name = formData.get("name") as string;
  const displayName = formData.get("displayName") as string;

  if (!name?.trim() || !displayName?.trim()) {
    return { error: "Group name and your display name are required." };
  }

  const supabase = await createClient();
  const inviteCode = generateInviteCode();

  const { data: group, error: groupError } = await supabase
    .from("groups")
    .insert({ name: name.trim(), invite_code: inviteCode })
    .select()
    .single();

  if (groupError) {
    return { error: "Failed to create group. Try again." };
  }

  const { data: member, error: memberError } = await supabase
    .from("members")
    .insert({ group_id: group.id, display_name: displayName.trim() })
    .select()
    .single();

  if (memberError) {
    return { error: "Failed to create your profile. Try again." };
  }

  await setMemberCookies(member.id, group.id);
  redirect(`/g/${group.id}`);
}

export async function joinGroup(_prevState: { error: string } | null, formData: FormData) {
  const code = formData.get("code") as string;
  const displayName = formData.get("displayName") as string;

  if (!code?.trim() || !displayName?.trim()) {
    return { error: "Invite code and display name are required." };
  }

  const supabase = await createClient();

  const { data: group, error: groupError } = await supabase
    .from("groups")
    .select()
    .eq("invite_code", code.trim().toLowerCase())
    .single();

  if (groupError || !group) {
    return { error: "Invalid invite code." };
  }

  // Check if already a member
  const existingMemberId = await getMemberId();
  if (existingMemberId) {
    const { data: existing } = await supabase
      .from("members")
      .select()
      .eq("id", existingMemberId)
      .eq("group_id", group.id)
      .single();

    if (existing) {
      await setMemberCookies(existing.id, group.id);
      redirect(`/g/${group.id}`);
    }
  }

  const { data: member, error: memberError } = await supabase
    .from("members")
    .insert({ group_id: group.id, display_name: displayName.trim() })
    .select()
    .single();

  if (memberError) {
    return { error: "Failed to join group. Try again." };
  }

  await setMemberCookies(member.id, group.id);
  redirect(`/g/${group.id}`);
}

export async function switchGroup(memberId: string, groupId: string) {
  await setMemberCookies(memberId, groupId);
  redirect(`/g/${groupId}`);
}

export async function getMyGroups() {
  const knownIds = await getKnownMemberIds();
  if (knownIds.length === 0) return [];

  const supabase = await createClient();
  const { data: members } = await supabase
    .from("members")
    .select("id, group_id, display_name, groups(id, name)")
    .in("id", knownIds);

  return members ?? [];
}

// ---- Event Actions ----

export async function createEvent(_prevState: { error: string } | null, formData: FormData) {
  const memberId = await getMemberId();
  const groupId = await getGroupId();
  if (!memberId || !groupId) {
    return { error: "You must be logged in." };
  }

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const location = formData.get("location") as string;
  const startTime = formData.get("startTime") as string;
  const endTime = formData.get("endTime") as string;

  if (!title?.trim() || !startTime) {
    return { error: "Title and start time are required." };
  }

  const supabase = await createClient();

  const { data: event, error } = await supabase
    .from("events")
    .insert({
      group_id: groupId,
      created_by: memberId,
      title: title.trim(),
      description: description?.trim() || null,
      location: location?.trim() || null,
      start_time: startTime,
      end_time: endTime || null,
    })
    .select()
    .single();

  if (error) {
    return { error: "Failed to create event." };
  }

  // Award XP for creating an event
  await supabase.rpc("award_xp", {
    p_member_id: memberId,
    p_event_id: event.id,
    p_reason: "created_event",
    p_amount: XP_REWARDS.created_event,
  });

  redirect(`/g/${groupId}/event/${event.id}`);
}

export async function deleteEvent(eventId: string) {
  const memberId = await getMemberId();
  const groupId = await getGroupId();
  if (!memberId || !groupId) {
    return { error: "You must be logged in." };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("events")
    .delete()
    .eq("id", eventId)
    .eq("created_by", memberId);

  if (error) {
    return { error: "Failed to delete event." };
  }

  redirect(`/g/${groupId}`);
}

// ---- RSVP Actions ----

export async function rsvpToEvent(eventId: string, status: string) {
  const memberId = await getMemberId();
  if (!memberId) {
    return { error: "You must be logged in." };
  }

  if (!["going", "maybe", "not_going"].includes(status)) {
    return { error: "Invalid RSVP status." };
  }

  const supabase = await createClient();

  // Check if already RSVPed
  const { data: existing } = await supabase
    .from("rsvps")
    .select()
    .eq("event_id", eventId)
    .eq("member_id", memberId)
    .single();

  if (existing) {
    await supabase
      .from("rsvps")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", existing.id);
  } else {
    await supabase
      .from("rsvps")
      .insert({ event_id: eventId, member_id: memberId, status });

    // Award XP only on first RSVP
    await supabase.rpc("award_xp", {
      p_member_id: memberId,
      p_event_id: eventId,
      p_reason: "rsvped",
      p_amount: XP_REWARDS.rsvped,
    });
  }

  const groupId = await getGroupId();
  revalidatePath(`/g/${groupId}`);
  revalidatePath(`/g/${groupId}/event/${eventId}`);
}

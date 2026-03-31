import { ImageResponse } from "next/og";
import { createClient } from "@/lib/supabase-server";

export const alt = "PDcAlendar Invite";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
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

  const memberCount = group
    ? (
        await supabase
          .from("members")
          .select("id", { count: "exact", head: true })
          .eq("group_id", group.id)
      ).count ?? 0
    : 0;

  const groupName = group?.name ?? "PDcAlendar";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #FDE68A 0%, #FFFBF0 30%, #FECDD3 70%, #C4B5FD 100%)",
          fontFamily: "sans-serif",
        }}
      >
        {/* Top decoration */}
        <div
          style={{
            display: "flex",
            fontSize: 48,
            marginBottom: 8,
          }}
        >
          🌸✨🎉
        </div>

        {/* Greek letters logo */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            background: "linear-gradient(135deg, #E8457C, #FB923C)",
            backgroundClip: "text",
            color: "transparent",
            marginBottom: 12,
          }}
        >
          ΦΔΑ
        </div>

        {/* Group name */}
        <div
          style={{
            fontSize: 56,
            fontWeight: 800,
            color: "#2D1B4E",
            marginBottom: 16,
          }}
        >
          {groupName}
        </div>

        {/* Invite text */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "white",
            borderRadius: 24,
            padding: "16px 40px",
            boxShadow: "0 4px 20px rgba(232, 69, 124, 0.15)",
            border: "2px solid #E8D5F5",
          }}
        >
          <div
            style={{
              fontSize: 32,
              fontWeight: 700,
              color: "#E8457C",
            }}
          >
            You&apos;re invited to join the squad!
          </div>
        </div>

        {/* Member count */}
        {memberCount > 0 && (
          <div
            style={{
              fontSize: 24,
              color: "#2D1B4E",
              opacity: 0.7,
              marginTop: 20,
            }}
          >
            {memberCount} member{memberCount !== 1 ? "s" : ""} already in 🔥
          </div>
        )}

        {/* Bottom branding */}
        <div
          style={{
            position: "absolute",
            bottom: 32,
            fontSize: 22,
            color: "#2D1B4E",
            opacity: 0.4,
          }}
        >
          PDcAlendar — Spring Quarter 2026
        </div>
      </div>
    ),
    { ...size }
  );
}

import { ImageResponse } from "next/og";

export const alt = "PDcAlendar";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
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
        <div
          style={{
            display: "flex",
            fontSize: 48,
            marginBottom: 8,
          }}
        >
          ☀️🌴🌸
        </div>

        <div
          style={{
            fontSize: 88,
            fontWeight: 800,
            background: "linear-gradient(135deg, #E8457C, #FB923C)",
            backgroundClip: "text",
            color: "transparent",
            marginBottom: 8,
          }}
        >
          ΦΔΑ
        </div>

        <div
          style={{
            fontSize: 52,
            fontWeight: 800,
            color: "#2D1B4E",
            marginBottom: 16,
          }}
        >
          PDcAlendar
        </div>

        <div
          style={{
            fontSize: 28,
            color: "#2D1B4E",
            opacity: 0.6,
          }}
        >
          Spring Quarter 2026 — the social calendar for the squad
        </div>
      </div>
    ),
    { ...size }
  );
}

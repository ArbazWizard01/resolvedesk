import { ImageResponse } from "next/og";

export const alt = "ResolveDesk: customer support ticketing software";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #eef2ff 0%, #ffffff 65%)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <svg width="96" height="96" viewBox="0 0 64 64" fill="none">
            <rect width="64" height="64" rx="16" fill="#4F46E5" />
            <rect x="14" y="13" width="36" height="29" rx="9" fill="#fff" />
            <path d="M21 38l-1 13 14-13z" fill="#fff" />
            <path
              d="M24 28l6.5 6.5L41 22"
              stroke="#4F46E5"
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div
            style={{
              marginLeft: 28,
              fontSize: 64,
              fontWeight: 800,
              color: "#0f172a",
            }}
          >
            ResolveDesk
          </div>
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 48,
            fontSize: 60,
            fontWeight: 800,
            lineHeight: 1.15,
            color: "#0f172a",
          }}
        >
          Resolve customer issues faster and smarter
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 24,
            fontSize: 30,
            color: "#475569",
          }}
        >
          Role-based ticketing, comments and activity history
        </div>
      </div>
    ),
    { ...size },
  );
}
import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #e11d48 0%, #f43f5e 100%)",
        }}
      >
        <span style={{ fontSize: 100 }}>📕</span>
      </div>
    ),
    { ...size }
  );
}

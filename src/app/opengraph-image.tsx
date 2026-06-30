import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "爆标题 - 小红书爆款标题生成器";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
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
          background: "linear-gradient(135deg, #fff1f2 0%, #fce7f3 50%, #fff7ed 100%)",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 24,
          }}
        >
          <span style={{ fontSize: 64 }}>📕</span>
          <span
            style={{
              fontSize: 72,
              fontWeight: 800,
              color: "#e11d48",
            }}
          >
            爆标题
          </span>
        </div>
        <p
          style={{
            fontSize: 36,
            color: "#3f3f46",
            margin: 0,
            fontWeight: 600,
          }}
        >
          小红书爆款标题生成器
        </p>
        <p
          style={{
            fontSize: 24,
            color: "#71717a",
            marginTop: 20,
          }}
        >
          爆款指数 · 对标仿写 · 完整笔记包
        </p>
        <div
          style={{
            marginTop: 40,
            display: "flex",
            gap: 16,
          }}
        >
          {["AI 评分", "手机预览", "敏感词检测"].map((tag) => (
            <span
              key={tag}
              style={{
                background: "white",
                color: "#e11d48",
                padding: "10px 24px",
                borderRadius: 999,
                fontSize: 20,
                fontWeight: 600,
                border: "2px solid #fecdd3",
              }}
            >
              {tag}
            </span>
          ))}
        </div>
        <p style={{ position: "absolute", bottom: 32, fontSize: 20, color: "#a1a1aa" }}>
          baotitle.asia
        </p>
      </div>
    ),
    { ...size }
  );
}

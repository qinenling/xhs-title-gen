import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "爆标题 - 小红书爆款标题生成器",
    short_name: "爆标题",
    description: "AI 一键生成小红书爆款标题和正文大纲",
    start_url: "/",
    display: "standalone",
    background_color: "#fff1f2",
    theme_color: "#e11d48",
    lang: "zh-CN",
    orientation: "portrait",
    icons: [
      {
        src: "/icon",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}

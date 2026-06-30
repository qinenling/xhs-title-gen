import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const base = process.env.TEST_BASE || "http://localhost:3000";

async function post(url, data) {
  const res = await fetch(`${base}${url}`, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  return { status: res.status, json };
}

async function main() {
  console.log("=== 爆标题 AI 接入测试 ===\n");

  const statusRes = await fetch(`${base}/api/status`);
  const status = await statusRes.json();
  console.log("[1] /api/status");
  console.log(JSON.stringify(status, null, 2));

  const gen = await post("/api/generate", {
    topic: "平价素颜霜测评",
    keywords: "学生党、百元内",
    styles: ["种草型", "干货型"],
    count: 2,
  });
  console.log("\n[2] /api/generate");
  console.log("HTTP:", gen.status);
  if (gen.json.error) {
    console.log("错误:", gen.json.error);
  } else {
    console.log("剩余次数:", gen.json.remaining);
    console.log("生成标题:");
    gen.json.titles?.forEach((t, i) => {
      console.log(`  ${i + 1}. [${t.style}] ${t.title}`);
    });
  }

  const firstTitle = gen.json.titles?.[0];
  if (firstTitle) {
    const outline = await post("/api/outline", {
      topic: "平价素颜霜测评",
      keywords: "学生党、百元内",
      title: firstTitle.title,
      style: firstTitle.style,
    });
    console.log("\n[3] /api/outline");
    console.log("HTTP:", outline.status);
    if (outline.json.error) {
      console.log("错误:", outline.json.error);
    } else {
      console.log("开头:", outline.json.outline?.opening?.slice(0, 60) + "...");
      console.log("小节数:", outline.json.outline?.sections?.length);
      console.log("标签:", outline.json.outline?.hashtags?.join(", "));
    }
  }

  console.log("\n=== 测试完成 ===");
}

main().catch((e) => {
  console.error("测试失败:", e.message);
  process.exit(1);
});

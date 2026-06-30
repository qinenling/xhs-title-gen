import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const base = process.env.TEST_BASE || "http://localhost:3000";

async function get(url) {
  const res = await fetch(`${base}${url}`);
  const json = await res.json();
  return { status: res.status, json };
}

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
  console.log("=== 爆标题 功能测试 ===\n");
  let passed = 0;
  let failed = 0;

  function ok(name) {
    console.log(`  ✓ ${name}`);
    passed++;
  }
  function fail(name, detail) {
    console.log(`  ✗ ${name}: ${detail}`);
    failed++;
  }

  const status = await get("/api/status");
  console.log("[1] /api/status");
  console.log(JSON.stringify(status.json, null, 2));
  if (status.json.version) ok("status 含 version");
  else fail("status 含 version", "missing");

  if (status.json.pro?.lifetime === true) ok("Pro 永久买断配置");
  else fail("Pro 永久配置", JSON.stringify(status.json.pro));

  const usage = await get("/api/usage");
  console.log("\n[2] /api/usage", usage.json);

  const gen = await post("/api/generate", {
    topic: "平价素颜霜测评",
    keywords: "学生党、百元内",
    styles: ["种草型", "干货型"],
    count: 2,
  });
  console.log("\n[3] /api/generate HTTP:", gen.status);
  if (gen.json.titles?.length > 0) {
    ok(`生成 ${gen.json.titles.length} 条标题`);
    const hasScore = gen.json.titles.every((t) => typeof t.score === "number");
    if (hasScore) ok("标题含爆款指数");
    else fail("爆款指数", "score 缺失");
  } else {
    fail("标题生成", gen.json.error || "无结果");
  }

  const firstTitle = gen.json.titles?.[0];
  if (firstTitle) {
    const outline = await post("/api/outline", {
      topic: "平价素颜霜测评",
      keywords: "学生党、百元内",
      title: firstTitle.title,
      style: firstTitle.style,
    });
    console.log("\n[4] /api/outline HTTP:", outline.status);
    if (outline.json.outline?.firstComment) ok("大纲含首评引导");
    else fail("完整笔记包字段", "firstComment 缺失");
  }

  const imitate = await post("/api/imitate", {
    referenceTitle: "用了 3 天！这个平价好物真的绝了 ✨",
    topic: "平价口红",
    count: 2,
  });
  console.log("\n[5] /api/imitate HTTP:", imitate.status);
  if (imitate.json.analysis && imitate.json.titles?.length) ok("对标仿写");
  else fail("对标仿写", imitate.json.error || "无结果");

  const cal = await post("/api/calendar", { niche: "美妆种草" });
  console.log("\n[6] /api/calendar HTTP:", cal.status, cal.json.error || "ok");
  if (cal.status === 403) ok("日历 Pro 门禁正常");
  else if (cal.json.days?.length === 7) ok("日历生成 7 天");
  else fail("日历", cal.json.error || cal.status);

  console.log(`\n=== 完成：${passed} 通过，${failed} 失败 ===`);
  if (failed > 0) process.exit(1);
}

main().catch((e) => {
  console.error("测试失败:", e.message);
  process.exit(1);
});

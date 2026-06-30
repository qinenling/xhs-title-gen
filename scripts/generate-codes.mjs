#!/usr/bin/env node
/**
 * 批量生成 Pro 激活码
 *
 * 用法：
 *   node scripts/generate-codes.mjs
 *   node scripts/generate-codes.mjs --count 20
 *   node scripts/generate-codes.mjs --count 10 --output codes.txt --csv codes.csv
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = {
    count: 10,
    prefix: "BAOTITLE",
    year: new Date().getFullYear(),
    output: "",
    csv: "",
    length: 4,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--count" || arg === "-n") opts.count = parseInt(args[++i], 10) || 10;
    else if (arg === "--prefix" || arg === "-p") opts.prefix = args[++i] || opts.prefix;
    else if (arg === "--year" || arg === "-y") opts.year = args[++i] || opts.year;
    else if (arg === "--output" || arg === "-o") opts.output = args[++i] || "";
    else if (arg === "--csv" || arg === "-c") opts.csv = args[++i] || "";
    else if (arg === "--length" || arg === "-l") opts.length = parseInt(args[++i], 10) || 4;
    else if (arg === "--help" || arg === "-h") {
      console.log(`
爆标题 · Pro 激活码批量生成

选项：
  -n, --count <数量>     生成数量（默认 10）
  -p, --prefix <前缀>    码前缀（默认 BAOTITLE）
  -y, --year <年份>      年份段（默认当前年）
  -l, --length <位数>    随机后缀长度（默认 4）
  -o, --output <文件>    输出 txt（每行一个码）
  -c, --csv <文件>       输出 csv（含状态列，方便发卡台账）

示例：
  node scripts/generate-codes.mjs --count 20
  node scripts/generate-codes.mjs -n 50 -o licenses/codes.txt -c licenses/codes.csv
`);
      process.exit(0);
    }
  }

  return opts;
}

function randomSuffix(length) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.randomBytes(length);
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars[bytes[i] % chars.length];
  }
  return result;
}

function generateCode(prefix, year, length) {
  return `${prefix}-${year}-${randomSuffix(length)}`;
}

function uniqueCodes(count, prefix, year, length) {
  const set = new Set();
  let attempts = 0;
  const maxAttempts = count * 20;

  while (set.size < count && attempts < maxAttempts) {
    set.add(generateCode(prefix, year, length));
    attempts++;
  }

  if (set.size < count) {
    console.error(`警告：仅生成 ${set.size} 个唯一码（请增加后缀长度）`);
  }

  return [...set];
}

function main() {
  const opts = parseArgs();
  const codes = uniqueCodes(opts.count, opts.prefix, opts.year, opts.length);
  const envLine = `PRO_LICENSE_CODES=${codes.join(",")}`;

  console.log("\n=== 爆标题 Pro 激活码 ===\n");
  codes.forEach((code, i) => console.log(`${String(i + 1).padStart(2, " ")}. ${code}`));
  console.log(`\n共 ${codes.length} 个\n`);

  console.log("--- 复制到 Vercel 环境变量 PRO_LICENSE_CODES ---");
  console.log(envLine);
  console.log("\n--- 或追加到已有码后面（逗号分隔）---\n");

  if (opts.output) {
    const outPath = path.resolve(process.cwd(), opts.output);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, codes.join("\n") + "\n", "utf8");
    console.log(`已写入 txt: ${outPath}`);
  }

  if (opts.csv) {
    const csvPath = path.resolve(process.cwd(), opts.csv);
    fs.mkdirSync(path.dirname(csvPath), { recursive: true });
    const header = "激活码,状态,用户微信,购买日期,备注\n";
    const rows = codes.map((c) => `${c},未发放,,,`).join("\n");
    fs.writeFileSync(csvPath, header + rows + "\n", "utf8");
    console.log(`已写入 csv: ${csvPath}`);
  }

  console.log("\n提示：");
  console.log("1. 生产环境务必设置 PRO_SECRET 为随机长字符串");
  console.log("2. 改 env 后 Vercel 需 Redeploy 才生效");
  console.log("3. 当前为一码可多次使用，发卡时自行台账管理\n");
}

main();

import type { GeneratedTitle, NoteOutline } from "./types";

export function outlineToText(outline: NoteOutline, title: string): string {
  const tags = outline.hashtags
    .map((t) => (t.startsWith("#") ? t : `#${t}`))
    .join(" ");
  const body = outline.sections
    .map((s) => `【${s.heading}】\n${s.content}`)
    .join("\n\n");

  const extras = [
    outline.coverText ? `📌 封面文案：${outline.coverText}` : "",
    outline.firstComment ? `💬 首评引导：${outline.firstComment}` : "",
    outline.interactionHook ? `🗣️ 互动话术：${outline.interactionHook}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  return `${title}\n\n${outline.opening}\n\n${body}\n\n${outline.closing}\n\n${tags}\n\n📷 配图建议：${outline.imageTips}${extras ? `\n\n${extras}` : ""}`;
}

export function exportMarkdown(
  topic: string,
  keywords: string,
  titles: GeneratedTitle[],
  outline: NoteOutline | null,
  outlineTitle: string
): string {
  const lines: string[] = [
    `# 小红书笔记素材`,
    ``,
    `> 主题：${topic}`,
  ];

  if (keywords) lines.push(`> 关键词：${keywords}`);
  lines.push(``, `## 备选标题`, ``);

  titles.forEach((t, i) => {
    lines.push(
      `${i + 1}. **[${t.style}]** ${t.title} · 爆款指数 ${t.score ?? "-"}`
    );
    lines.push(`   - ${t.reason}`);
  });

  if (outline) {
    lines.push(``, `## 正文（${outlineTitle}）`, ``, outline.opening, ``);
    outline.sections.forEach((s) => {
      lines.push(`### ${s.heading}`, ``, s.content, ``);
    });
    lines.push(`## 结尾互动`, ``, outline.closing, ``);
    lines.push(
      `## 标签`,
      ``,
      outline.hashtags.map((t) => `#${t.replace(/^#/, "")}`).join(" "),
      ``
    );
    if (outline.coverText) {
      lines.push(`## 封面文案`, ``, outline.coverText, ``);
    }
    if (outline.firstComment) {
      lines.push(`## 首评引导`, ``, outline.firstComment, ``);
    }
    if (outline.interactionHook) {
      lines.push(`## 互动话术`, ``, outline.interactionHook, ``);
    }
    lines.push(`## 配图建议`, ``, outline.imageTips);
  }

  lines.push(``, `---`, `*由爆标题生成 · ${new Date().toLocaleDateString("zh-CN")}*`);
  return lines.join("\n");
}

/** 导出 CSV（Excel 可直接打开） */
export function exportTitlesCsv(
  topic: string,
  titles: GeneratedTitle[]
): string {
  const header = "序号,爆款指数,风格,标题,点评";
  const rows = titles.map((t, i) => {
    const escape = (s: string) => `"${s.replace(/"/g, '""')}"`;
    return [
      i + 1,
      t.score ?? "",
      escape(t.style),
      escape(t.title),
      escape(t.reason),
    ].join(",");
  });
  return `\uFEFF${header}\n${rows.join("\n")}\n主题,${topic}\n`;
}

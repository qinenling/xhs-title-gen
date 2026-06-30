import type { GeneratedTitle, NoteOutline } from "./types";

export function outlineToText(outline: NoteOutline, title: string): string {
  const tags = outline.hashtags
    .map((t) => (t.startsWith("#") ? t : `#${t}`))
    .join(" ");
  const body = outline.sections
    .map((s) => `【${s.heading}】\n${s.content}`)
    .join("\n\n");

  return `${title}\n\n${outline.opening}\n\n${body}\n\n${outline.closing}\n\n${tags}\n\n📷 配图建议：${outline.imageTips}`;
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
    lines.push(`${i + 1}. **[${t.style}]** ${t.title}`);
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
      ``,
      `## 配图建议`,
      ``,
      outline.imageTips
    );
  }

  lines.push(``, `---`, `*由爆标题生成 · ${new Date().toLocaleDateString("zh-CN")}*`);
  return lines.join("\n");
}

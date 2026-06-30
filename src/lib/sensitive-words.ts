export type SensitiveSeverity = "high" | "medium";

export interface SensitiveHit {
  word: string;
  suggestion: string;
  severity: SensitiveSeverity;
  index: number;
}

interface WordRule {
  word: string;
  suggestion: string;
  severity: SensitiveSeverity;
}

/** 小红书常见限流 / 违规风险词（启发式规则，非官方词库） */
const WORD_RULES: WordRule[] = [
  { word: "最好", suggestion: "很不错 / 超级好用", severity: "high" },
  { word: "最佳", suggestion: "很推荐 / 心头好", severity: "high" },
  { word: "第一", suggestion: "前列 / 数一数二", severity: "high" },
  { word: "首选", suggestion: "优先试试 / 值得入手", severity: "high" },
  { word: "100%", suggestion: "大部分 / 亲测有效", severity: "high" },
  { word: "百分百", suggestion: "大部分 / 亲测有效", severity: "high" },
  { word: "绝对", suggestion: "真的 / 确实", severity: "high" },
  { word: "保证", suggestion: "亲测 / 实测", severity: "high" },
  { word: "永久", suggestion: "长期 / 持续", severity: "high" },
  { word: "万能", suggestion: "百搭 / 实用", severity: "medium" },
  { word: "顶级", suggestion: "高端 / 品质感", severity: "medium" },
  { word: "极致", suggestion: "很出挑 / 很惊艳", severity: "medium" },
  { word: "全网", suggestion: "很多人 / 超火", severity: "medium" },
  { word: "最低价", suggestion: "性价比高 / 平价", severity: "high" },
  { word: "最便宜", suggestion: "平价 / 百元内", severity: "high" },
  { word: "秒杀", suggestion: "很划算 / 值得冲", severity: "medium" },
  { word: "治愈", suggestion: "舒缓 / 放松", severity: "medium" },
  { word: "医疗", suggestion: "护理 / 保养", severity: "high" },
  { word: "治疗", suggestion: "改善 / 调理", severity: "high" },
  { word: "药", suggestion: "好物 / 神器", severity: "medium" },
  { word: "减肥", suggestion: "瘦身 / 体态管理", severity: "medium" },
  { word: "增肥", suggestion: "长肉 / 体重变化", severity: "medium" },
  { word: "微信", suggestion: "私信 / 评论区", severity: "medium" },
  { word: "加我", suggestion: "评论区见 / 主页有", severity: "medium" },
  { word: "二维码", suggestion: "评论区 / 主页", severity: "high" },
  { word: "最强", suggestion: "很能打 / 超实力", severity: "high" },
  { word: "国家级", suggestion: "专业级 / 高标准", severity: "high" },
  { word: "王牌", suggestion: "招牌 / 经典", severity: "medium" },
  { word: "史无前例", suggestion: "少见 / 难得", severity: "high" },
  { word: "全网最低", suggestion: "性价比高 / 平价", severity: "high" },
  { word: "零差评", suggestion: "口碑不错 / 反馈好", severity: "high" },
  { word: "必备", suggestion: "值得入手 / 推荐", severity: "medium" },
  { word: "神器", suggestion: "好物 / 宝藏", severity: "medium" },
  { word: "逆天", suggestion: "惊艳 / 太绝了", severity: "medium" },
  { word: "吊打", suggestion: "超越 / 比一比", severity: "medium" },
  { word: "完爆", suggestion: "优于 / 更出色", severity: "medium" },
  { word: "白嫖", suggestion: "免费领 / 福利", severity: "medium" },
  { word: "私信", suggestion: "评论区 / 主页", severity: "medium" },
  { word: "代购", suggestion: "渠道 / 购买方式", severity: "medium" },
  { word: "链接", suggestion: "评论区见 / 主页", severity: "medium" },
  { word: "点击购买", suggestion: "感兴趣评论区聊", severity: "high" },
  { word: "立刻下单", suggestion: "值得试试", severity: "high" },
  { word: "疗效", suggestion: "效果 / 体验", severity: "high" },
  { word: "处方", suggestion: "方案 / 方法", severity: "high" },
  { word: "根治", suggestion: "改善 / 缓解", severity: "high" },
  { word: "祛斑", suggestion: "提亮 / 均匀肤色", severity: "medium" },
  { word: "祛痘", suggestion: "改善痘痘肌", severity: "medium" },
  { word: "丰胸", suggestion: "体态管理", severity: "high" },
  { word: "壮阳", suggestion: "精力管理", severity: "high" },
];

export function scanSensitiveText(text: string): SensitiveHit[] {
  if (!text.trim()) return [];

  const hits: SensitiveHit[] = [];
  const lower = text.toLowerCase();

  for (const rule of WORD_RULES) {
    let start = 0;
    while (start < text.length) {
      const idx = lower.indexOf(rule.word.toLowerCase(), start);
      if (idx === -1) break;

      const overlaps = hits.some(
        (h) =>
          (idx >= h.index && idx < h.index + h.word.length) ||
          (h.index >= idx && h.index < idx + rule.word.length)
      );

      if (!overlaps) {
        hits.push({
          word: text.slice(idx, idx + rule.word.length),
          suggestion: rule.suggestion,
          severity: rule.severity,
          index: idx,
        });
      }

      start = idx + rule.word.length;
    }
  }

  return hits.sort((a, b) => a.index - b.index);
}

export function scanTitles(titles: string[]): Map<string, SensitiveHit[]> {
  const map = new Map<string, SensitiveHit[]>();
  for (const title of titles) {
    const hits = scanSensitiveText(title);
    if (hits.length > 0) map.set(title, hits);
  }
  return map;
}

/** 扫描正文大纲各段落 */
export function scanOutlineText(parts: { label: string; text: string }[]): Map<string, SensitiveHit[]> {
  const map = new Map<string, SensitiveHit[]>();
  for (const { label, text } of parts) {
    if (!text.trim()) continue;
    const hits = scanSensitiveText(text);
    if (hits.length > 0) {
      map.set(`${label}：${text.slice(0, 24)}${text.length > 24 ? "…" : ""}`, hits);
    }
  }
  return map;
}

export function hasHighRisk(hits: SensitiveHit[]): boolean {
  return hits.some((h) => h.severity === "high");
}

/** 信息流双列卡片约显示 2 行，按字符估算截断 */
export function truncateFeedTitle(title: string, maxChars = 22): string {
  const chars = [...title];
  if (chars.length <= maxChars) return title;
  return chars.slice(0, maxChars).join("") + "…";
}

export function highlightSensitiveText(
  text: string,
  hits: SensitiveHit[]
): { before: string; word: string; after: string }[] {
  if (hits.length === 0) return [{ before: text, word: "", after: "" }];

  const segments: { before: string; word: string; after: string }[] = [];
  let cursor = 0;

  for (const hit of hits) {
    if (hit.index > cursor) {
      segments.push({ before: text.slice(cursor, hit.index), word: "", after: "" });
    }
    segments.push({
      before: "",
      word: text.slice(hit.index, hit.index + hit.word.length),
      after: "",
    });
    cursor = hit.index + hit.word.length;
  }

  if (cursor < text.length) {
    segments.push({ before: text.slice(cursor), word: "", after: "" });
  }

  return segments;
}

export interface AiSensitiveHit {
  word: string;
  suggestion: string;
  reason: string;
}

/** 合并规则检测与 AI 检测结果 */
export function mergeSensitiveHits(
  ruleHits: SensitiveHit[],
  aiHits: AiSensitiveHit[]
): SensitiveHit[] {
  const merged = [...ruleHits];
  const lowerText = ruleHits.map((h) => h.word.toLowerCase());

  for (const ai of aiHits) {
    if (lowerText.some((w) => w.includes(ai.word.toLowerCase()))) continue;
    merged.push({
      word: ai.word,
      suggestion: ai.suggestion,
      severity: "medium",
      index: -1,
    });
  }

  return merged;
}

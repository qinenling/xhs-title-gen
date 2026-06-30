import type { GeneratedTitle, NoteOutline, TitleStyle } from "./types";
import {
  buildImitatePrompt,
  buildOutlinePrompt,
  buildTitlePrompt,
} from "./prompts";

const DEMO_TITLES: GeneratedTitle[] = [
  {
    title: "用了 3 天！这个平价好物真的绝了 ✨",
    style: "种草型",
    reason: "时间+平价+感叹，降低决策门槛",
    score: 91,
  },
  {
    title: "新手必看｜5 步搞定，再也不踩坑",
    style: "干货型",
    reason: "明确受众+步骤感，实用价值清晰",
    score: 88,
  },
  {
    title: "千万别再这样做了… 90% 的人都错了",
    style: "悬念型",
    reason: "反常识+数字，激发好奇心",
    score: 86,
  },
  {
    title: "7 个习惯，让我半年变了一个人",
    style: "数字型",
    reason: "具体数字+转变故事，可信度高",
    score: 84,
  },
  {
    title: "终于有人把这件事说清楚了 😭",
    style: "情感型",
    reason: "共鸣+情绪 emoji，引发认同",
    score: 82,
  },
];

function demoOutline(topic: string, title: string): NoteOutline {
  const subject = topic.slice(0, 10) || "这个主题";
  return {
    opening: `姐妹们！${title} 这条我憋了好几天，今天全部掏心窝分享 🙋‍♀️`,
    sections: [
      {
        heading: "为什么值得看",
        content: `关于${subject}，我踩过坑也走过弯路。这篇帮你少花冤枉钱、少浪费时间。`,
      },
      {
        heading: "我的真实体验",
        content:
          "按时间线讲清楚：一开始的状态 → 尝试过程 → 现在的变化。有图有真相，不夸大。",
      },
      {
        heading: "具体怎么做",
        content:
          "Step1 先准备…\nStep2 注意这个细节…\nStep3 坚持 3 天就能看到变化",
      },
      {
        heading: "避坑提醒",
        content: "这几个误区千万别踩！特别是新手最容易忽略的第 2 点。",
      },
    ],
    closing: "你们还想看哪部分？评论区告诉我，点赞收藏不迷路～",
    hashtags: [
      subject.slice(0, 6),
      "干货分享",
      "真实测评",
      "小红书攻略",
      "日更挑战",
    ],
    imageTips: "封面：大字标题 + 前后对比或产品特写；内页：步骤截图 + 清单卡片",
    firstComment: "姐妹们问的链接/方法我放评论区了，有需要的自取～",
    interactionHook: "你们更想看测评还是教程？评论区告诉我，下期安排！",
    coverText: subject.slice(0, 8) || "必看干货",
  };
}

function normalizeScore(raw: unknown, fallback = 78): number {
  const n = Number(raw);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(100, Math.max(0, Math.round(n)));
}

function sortByScore(titles: GeneratedTitle[]): GeneratedTitle[] {
  return [...titles].sort((a, b) => b.score - a.score);
}

async function chatCompletion(
  prompt: string,
  temperature = 0.85
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("NO_API_KEY");
  }

  const baseUrl =
    process.env.OPENAI_BASE_URL?.replace(/\/$/, "") ||
    "https://api.openai.com/v1";
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`AI 服务异常：${response.status} ${err.slice(0, 120)}`);
  }

  const data = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };

  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("AI 未返回内容，请重试");
  }

  return content;
}

function parseTitles(content: string): GeneratedTitle[] {
  const jsonMatch = content.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    throw new Error("AI 返回格式异常，请重试");
  }

  const parsed = JSON.parse(jsonMatch[0]) as GeneratedTitle[];

  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error("未生成有效标题，请重试");
  }

  return sortByScore(
    parsed.map((item, i) => ({
      title: String(item.title).trim(),
      style: item.style as TitleStyle,
      reason: String(item.reason || "").trim(),
      score: normalizeScore(item.score, 85 - i * 2),
    }))
  );
}

function parseImitate(content: string): {
  analysis: string;
  titles: GeneratedTitle[];
} {
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("AI 返回格式异常，请重试");
  }

  const parsed = JSON.parse(jsonMatch[0]) as {
    analysis?: string;
    titles?: GeneratedTitle[];
  };

  if (!parsed.titles || parsed.titles.length === 0) {
    throw new Error("未生成有效标题，请重试");
  }

  return {
    analysis: String(parsed.analysis || "结构清晰，钩子明确").trim(),
    titles: sortByScore(
      parsed.titles.map((item, i) => ({
        title: String(item.title).trim(),
        style: item.style as TitleStyle,
        reason: String(item.reason || "").trim(),
        score: normalizeScore(item.score, 84 - i * 2),
      }))
    ),
  };
}

function parseOutline(content: string): NoteOutline {
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("AI 返回格式异常，请重试");
  }

  const parsed = JSON.parse(jsonMatch[0]) as NoteOutline;

  if (!parsed.opening || !Array.isArray(parsed.sections)) {
    throw new Error("未生成有效大纲，请重试");
  }

  return {
    opening: String(parsed.opening).trim(),
    sections: parsed.sections.map((s) => ({
      heading: String(s.heading).trim(),
      content: String(s.content).trim(),
    })),
    closing: String(parsed.closing || "").trim(),
    hashtags: (parsed.hashtags || []).map((t) => String(t).trim()),
    imageTips: String(parsed.imageTips || "").trim(),
    firstComment: String(parsed.firstComment || "需要的姐妹评论区见～").trim(),
    interactionHook: String(
      parsed.interactionHook || "你们还想看哪部分？评论区告诉我"
    ).trim(),
    coverText: String(parsed.coverText || "").trim(),
  };
}

export async function generateTitles(
  topic: string,
  keywords: string,
  styles: TitleStyle[],
  count: number
): Promise<GeneratedTitle[]> {
  if (!process.env.OPENAI_API_KEY) {
    await new Promise((r) => setTimeout(r, 800));
    return sortByScore(
      DEMO_TITLES.slice(0, Math.min(count, DEMO_TITLES.length)).map((t) => ({
        ...t,
        title: t.title.replace(/这个|这件事/, topic.slice(0, 6) || "这个"),
      }))
    );
  }

  const content = await chatCompletion(
    buildTitlePrompt(topic, keywords, styles, count),
    0.9
  );
  return parseTitles(content);
}

export async function generateImitate(
  referenceTitle: string,
  topic: string,
  count: number
): Promise<{ analysis: string; titles: GeneratedTitle[] }> {
  if (!process.env.OPENAI_API_KEY) {
    await new Promise((r) => setTimeout(r, 900));
    return {
      analysis: "对标标题用了「时间+感叹+平价」结构，降低决策门槛，激发好奇",
      titles: sortByScore(
        DEMO_TITLES.slice(0, Math.min(count, DEMO_TITLES.length)).map((t) => ({
          ...t,
          title: t.title.replace(/平价好物|这件事/, topic.slice(0, 6) || "好物"),
        }))
      ),
    };
  }

  const content = await chatCompletion(
    buildImitatePrompt(referenceTitle, topic, count),
    0.88
  );
  return parseImitate(content);
}

export async function generateOutline(
  topic: string,
  keywords: string,
  title: string,
  style: TitleStyle
): Promise<NoteOutline> {
  if (!process.env.OPENAI_API_KEY) {
    await new Promise((r) => setTimeout(r, 1000));
    return demoOutline(topic, title);
  }

  const content = await chatCompletion(
    buildOutlinePrompt(topic, keywords, title, style),
    0.8
  );
  return parseOutline(content);
}

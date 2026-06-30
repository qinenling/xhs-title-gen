import type { TitleStyle } from "./types";

const STYLE_GUIDE: Record<TitleStyle, string> = {
  种草型: "突出好物/体验，激发购买或尝试欲",
  干货型: "强调实用价值、方法、教程",
  悬念型: "留悬念、反常识，激发好奇心",
  数字型: "用具体数字增强可信度（如 3 个方法、5 分钟）",
  情感型: "共鸣、故事感、情绪价值",
  对比型: "Before/After、红黑榜、踩坑vs正确，制造反差",
  清单型: "合集/盘点/必买清单，收藏欲强",
  故事型: "第一人称经历，真实感、代入感",
  热点型: "结合当下流行词/季节/节日，蹭热点但不生硬",
  提问型: "用问句勾住目标人群（谁还在…？为什么…？）",
};

export function buildTitlePrompt(
  topic: string,
  keywords: string,
  styles: TitleStyle[],
  count: number
): string {
  const styleDesc = styles
    .map((s) => `- ${s}：${STYLE_GUIDE[s]}`)
    .join("\n");

  return `你是资深小红书爆款标题专家，熟悉平台算法和用户点击心理。

## 任务
为以下笔记主题生成 ${count} 个小红书标题，从以下风格中选取最合适的覆盖：${styles.join("、")}。

## 笔记信息
- 主题：${topic}
${keywords ? `- 关键词/卖点：${keywords}` : ""}

## 标题要求
1. 每个标题 10-20 个汉字为佳，不超过 25 字
2. 适当使用 emoji（1-2 个），符合小红书调性
3. 避免标题党、虚假宣传、绝对化用语（最好、第一、100% 等）
4. 标题之间差异要大，方便 A/B 测试
5. 口语化、有画面感，让人想点进去
6. 若风格数量多于 ${count}，优先选最适合主题的 ${count} 种，每种 1 条

## 风格说明
${styleDesc}

## 爆款指数评分
为每条标题给出 score（0-100 整数），综合评估：
- 点击吸引力（悬念/数字/人群标签）
- 小红书调性（口语化、emoji 适度）
- 搜索与推荐友好度
- 避免违规词和标题党

## 输出格式
严格输出 JSON 数组，不要 markdown 代码块，不要其他文字：
[
  {"title": "标题文字", "style": "种草型", "reason": "一句话说明为什么这个标题有效", "score": 85},
  ...
]`;
}

export function buildImitatePrompt(
  referenceTitle: string,
  topic: string,
  count: number
): string {
  return `你是资深小红书爆款标题专家，擅长拆解爆款结构并仿写。

## 任务
1. 用 1 句话分析对标标题的结构套路（用了什么钩子、人群、数字、emoji 等）
2. 生成 ${count} 条「同结构套路、全新内容」的小红书标题

## 对标爆款标题
${referenceTitle}

## 新笔记主题
${topic || "保持对标标题的赛道，换具体产品/场景/角度"}

## 标题要求
1. 每个标题 10-20 个汉字为佳，不超过 25 字
2. 适当使用 emoji（1-2 个），符合小红书调性
3. 结构模仿对标标题，但内容必须全新，不可抄袭
4. 避免标题党、虚假宣传、绝对化用语
5. 标题之间差异要大

## 输出格式
严格输出 JSON 对象，不要 markdown 代码块，不要其他文字：
{
  "analysis": "一句话分析对标标题的结构套路",
  "titles": [
    {"title": "标题文字", "style": "种草型", "reason": "说明如何复用了对标结构", "score": 85},
    ...
  ]
}`;
}

export function buildOutlinePrompt(
  topic: string,
  keywords: string,
  title: string,
  style: TitleStyle
): string {
  return `你是资深小红书内容策划，擅长写高互动、高收藏的图文笔记结构。

## 任务
根据已选标题，生成一份可直接照着写的正文大纲。

## 笔记信息
- 主题：${topic}
${keywords ? `- 关键词/卖点：${keywords}` : ""}
- 已选标题：${title}
- 标题风格：${style}（${STYLE_GUIDE[style]}）

## 大纲要求
1. 开头 1-2 句要有钩子，让人想继续读
2. 正文分 3-4 个小节，每节有清晰小标题 + 2-3 句要点
3. 口语化、有代入感，适当 emoji，符合小红书调性
4. 结尾引导互动（评论/收藏/关注）
5. 推荐 5-8 个相关 hashtag
6. 给 1 句配图建议（封面 + 内页）
7. 总篇幅适合 300-600 字图文笔记
8. 避免虚假宣传、绝对化用语
9. firstComment：首评引导语（15-30 字，如引导求链接/求教程/互动）
10. interactionHook：评论区互动话术（引导用户评论的二选一或提问）
11. coverText：封面大字文案（12 字以内，适合封面图）

## 输出格式
严格输出 JSON 对象，不要 markdown 代码块，不要其他文字：
{
  "opening": "开头钩子段落",
  "sections": [
    {"heading": "小节标题", "content": "该节要点，可多句"},
    ...
  ],
  "closing": "结尾互动引导",
  "hashtags": ["标签1", "标签2", ...],
  "imageTips": "配图建议",
  "firstComment": "首评引导语",
  "interactionHook": "评论区互动话术",
  "coverText": "封面短文案"
}`;
}

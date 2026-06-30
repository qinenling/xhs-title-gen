import { NextResponse } from "next/server";
import { generateTitles } from "@/lib/ai";
import {
  FREE_TITLE_COUNT,
  isProUser,
  PRO_TITLE_COUNT,
} from "@/lib/pro";
import { consumeUsage } from "@/lib/rate-limit";
import { TITLE_STYLES, type GenerateRequest } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as GenerateRequest;

    const topic = body.topic?.trim();
    if (!topic || topic.length < 2) {
      return NextResponse.json(
        { error: "请填写笔记主题（至少 2 个字）" },
        { status: 400 }
      );
    }

    const isPro = isProUser(request);
    const usage = consumeUsage(request, isPro);

    if (!usage.allowed) {
      return NextResponse.json(
        {
          error: "今日免费次数已用完，升级 Pro 或明天再来",
          remaining: 0,
          isPro: false,
        },
        { status: 429 }
      );
    }

    const styles =
      body.styles?.length > 0
        ? body.styles.filter((s) => TITLE_STYLES.includes(s))
        : TITLE_STYLES;

    const maxCount = isPro ? PRO_TITLE_COUNT : FREE_TITLE_COUNT;
    const count = Math.min(Math.max(body.count ?? maxCount, 3), maxCount);
    const keywords = body.keywords?.trim() || "";

    const titles = await generateTitles(topic, keywords, styles, count);

    return NextResponse.json({
      titles,
      remaining: usage.remaining,
      isPro,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "生成失败，请稍后重试";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

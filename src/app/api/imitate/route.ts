import { NextResponse } from "next/server";
import { generateImitate } from "@/lib/ai";
import {
  FREE_TITLE_COUNT,
  isProUser,
  PRO_TITLE_COUNT,
} from "@/lib/pro";
import { consumeUsage } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      referenceTitle?: string;
      topic?: string;
      count?: number;
    };

    const referenceTitle = body.referenceTitle?.trim();
    if (!referenceTitle || referenceTitle.length < 4) {
      return NextResponse.json(
        { error: "请粘贴对标爆款标题（至少 4 个字）" },
        { status: 400 }
      );
    }

    const isPro = isProUser(request);
    const usage = await consumeUsage(request, isPro);

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

    const maxCount = isPro ? PRO_TITLE_COUNT : FREE_TITLE_COUNT;
    const count = Math.min(Math.max(body.count ?? maxCount, 3), maxCount);
    const topic = body.topic?.trim() || "";

    const { analysis, titles } = await generateImitate(
      referenceTitle,
      topic,
      count
    );

    return NextResponse.json({
      analysis,
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

import { NextResponse } from "next/server";
import { generateOutline } from "@/lib/ai";
import { isProUser } from "@/lib/pro";
import { consumeUsage } from "@/lib/rate-limit";
import { TITLE_STYLES, type OutlineRequest } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as OutlineRequest;

    const topic = body.topic?.trim();
    const title = body.title?.trim();

    if (!topic || topic.length < 2) {
      return NextResponse.json({ error: "请填写笔记主题" }, { status: 400 });
    }

    if (!title) {
      return NextResponse.json({ error: "请选择或填写标题" }, { status: 400 });
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

    const style = TITLE_STYLES.includes(body.style) ? body.style : "干货型";
    const keywords = body.keywords?.trim() || "";

    const outline = await generateOutline(topic, keywords, title, style);

    return NextResponse.json({
      outline,
      remaining: usage.remaining,
      isPro,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "生成失败，请稍后重试";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

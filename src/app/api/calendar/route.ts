import { NextResponse } from "next/server";
import { generateCalendar } from "@/lib/ai";
import { isProUser } from "@/lib/pro";
import { consumeUsage } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const isPro = isProUser(request);

    if (!isPro) {
      return NextResponse.json(
        { error: "7 日选题日历为 Pro 专属功能，升级后可用", isPro: false },
        { status: 403 }
      );
    }

    const body = (await request.json()) as {
      niche?: string;
      keywords?: string;
    };

    const niche = body.niche?.trim();
    if (!niche || niche.length < 2) {
      return NextResponse.json(
        { error: "请填写内容赛道（至少 2 个字）" },
        { status: 400 }
      );
    }

    const usage = await consumeUsage(request, isPro);
    if (!usage.allowed) {
      return NextResponse.json(
        { error: "今日次数已用完", remaining: 0, isPro: true },
        { status: 429 }
      );
    }

    const keywords = body.keywords?.trim() || "";
    const days = await generateCalendar(niche, keywords);

    return NextResponse.json({
      days,
      remaining: usage.remaining,
      isPro: true,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "生成失败，请稍后重试";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

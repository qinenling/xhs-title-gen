import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  generateProCookieValue,
  getProCookieOptions,
  isProUser,
  PRO_COOKIE,
  PRO_IS_LIFETIME,
  validateLicenseCode,
} from "@/lib/pro";
import { consumeActivateAttempt } from "@/lib/rate-limit";

export async function GET(request: Request) {
  return NextResponse.json({
    isPro: isProUser(request),
    isLifetime: PRO_IS_LIFETIME && isProUser(request),
  });
}

export async function POST(request: Request) {
  try {
    const attempt = await consumeActivateAttempt(request);
    if (!attempt.allowed) {
      return NextResponse.json({ error: "请稍后再试" }, { status: 429 });
    }

    const body = (await request.json()) as { code?: string };
    const code = body.code?.trim();

    if (!code) {
      return NextResponse.json({ error: "请输入激活码" }, { status: 400 });
    }

    if (!validateLicenseCode(code)) {
      return NextResponse.json({ error: "激活码无效" }, { status: 400 });
    }

    const cookieValue = generateProCookieValue();

    const cookieStore = await cookies();
    cookieStore.set(PRO_COOKIE.name, cookieValue, getProCookieOptions());

    return NextResponse.json({
      success: true,
      message: PRO_IS_LIFETIME
        ? "Pro 已永久激活，享受无限生成！"
        : "Pro 已激活！",
      isPro: true,
      isLifetime: PRO_IS_LIFETIME,
    });
  } catch {
    return NextResponse.json({ error: "激活失败" }, { status: 500 });
  }
}

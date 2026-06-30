import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  generateProToken,
  isProUser,
  PRO_COOKIE,
  validateLicenseCode,
} from "@/lib/pro";

export async function GET(request: Request) {
  return NextResponse.json({ isPro: isProUser(request) });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { code?: string };
    const code = body.code?.trim();

    if (!code) {
      return NextResponse.json({ error: "请输入激活码" }, { status: 400 });
    }

    if (!validateLicenseCode(code)) {
      return NextResponse.json(
        { error: "激活码无效，请检查后重试" },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    cookieStore.set(PRO_COOKIE.name, generateProToken(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: PRO_COOKIE.maxAge,
      path: "/",
    });

    return NextResponse.json({
      success: true,
      message: "Pro 已激活，享受无限生成！",
      isPro: true,
    });
  } catch {
    return NextResponse.json({ error: "激活失败，请重试" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  generateProCookieValue,
  getProCookieOptions,
  getProExpiry,
  isProUser,
  PRO_COOKIE,
  PRO_IS_LIFETIME,
  FREE_DAILY_LIMIT,
} from "@/lib/pro";
import { getUsageSnapshot } from "@/lib/rate-limit";

export async function GET(request: Request) {
  const isPro = isProUser(request);

  if (isPro) {
    const cookieStore = await cookies();
    cookieStore.set(
      PRO_COOKIE.name,
      generateProCookieValue(),
      getProCookieOptions()
    );
  }

  const usage = await getUsageSnapshot(request, isPro);

  return NextResponse.json({
    isPro,
    isLifetime: isPro && PRO_IS_LIFETIME,
    expiresAt: getProExpiry(request),
    ...usage,
    limit: isPro ? null : FREE_DAILY_LIMIT,
  });
}

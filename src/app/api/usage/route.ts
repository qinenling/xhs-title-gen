import { NextResponse } from "next/server";
import { isProUser, FREE_DAILY_LIMIT } from "@/lib/pro";
import { getUsageSnapshot } from "@/lib/rate-limit";

export async function GET(request: Request) {
  const isPro = isProUser(request);
  const usage = getUsageSnapshot(request, isPro);

  return NextResponse.json({
    isPro,
    ...usage,
    limit: isPro ? null : FREE_DAILY_LIMIT,
  });
}

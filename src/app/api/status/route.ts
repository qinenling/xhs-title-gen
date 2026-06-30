import { NextResponse } from "next/server";
import { PRO_IS_LIFETIME, PRO_PRICE_LABEL } from "@/lib/constants";
import { isRedisEnabled } from "@/lib/redis";

export async function GET() {
  const hasApiKey = Boolean(process.env.OPENAI_API_KEY);
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  const baseUrl = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";

  return NextResponse.json({
    mode: hasApiKey ? "live" : "demo",
    model: hasApiKey ? model : null,
    provider: hasApiKey ? baseUrl.replace(/\/v1\/?$/, "") : null,
    version: "1.0.0",
    pro: {
      lifetime: PRO_IS_LIFETIME,
      price: PRO_PRICE_LABEL,
    },
    redis: isRedisEnabled(),
  });
}

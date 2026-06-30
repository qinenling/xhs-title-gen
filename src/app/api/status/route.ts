import { NextResponse } from "next/server";

export async function GET() {
  const hasApiKey = Boolean(process.env.OPENAI_API_KEY);
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  const baseUrl = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";

  return NextResponse.json({
    mode: hasApiKey ? "live" : "demo",
    model: hasApiKey ? model : null,
    provider: hasApiKey ? baseUrl.replace(/\/v1\/?$/, "") : null,
  });
}

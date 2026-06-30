import { NextResponse } from "next/server";
import { scanSensitiveWithAI } from "@/lib/ai";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { text?: string };
    const text = body.text?.trim();

    if (!text || text.length < 4) {
      return NextResponse.json({ hits: [] });
    }

    const hits = await scanSensitiveWithAI(text);
    return NextResponse.json({ hits });
  } catch {
    return NextResponse.json({ hits: [] });
  }
}

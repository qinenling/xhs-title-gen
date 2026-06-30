"use client";

import { useEffect, useState } from "react";
import { DEMO_KEYWORDS, DEMO_TITLES, DEMO_TOPIC } from "@/lib/demo-data";
import TitleCard from "./TitleCard";

interface DemoPreviewProps {
  onTryDemo: (topic: string, keywords: string) => void;
}

export default function DemoPreview({ onTryDemo }: DemoPreviewProps) {
  const [visibleCount, setVisibleCount] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (dismissed) return;

    const timers: ReturnType<typeof setTimeout>[] = [];
    DEMO_TITLES.forEach((_, i) => {
      timers.push(
        setTimeout(() => {
          setVisibleCount(i + 1);
        }, 400 + i * 350)
      );
    });

    return () => timers.forEach(clearTimeout);
  }, [dismissed]);

  if (dismissed) return null;

  return (
    <div className="mb-8 overflow-hidden rounded-2xl border border-rose-200 bg-gradient-to-br from-rose-50 via-white to-pink-50 shadow-sm">
      <div className="border-b border-rose-100 bg-white/60 px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-rose-500">
              演示 · 无需登录
            </p>
            <h2 className="mt-1 text-lg font-bold text-zinc-900">
              看看 AI 能帮你生成什么
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              主题：<span className="font-medium text-zinc-700">{DEMO_TOPIC}</span>
              {DEMO_KEYWORDS && (
                <span className="text-zinc-400"> · {DEMO_KEYWORDS}</span>
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="shrink-0 text-xs text-zinc-400 hover:text-zinc-600"
          >
            收起
          </button>
        </div>
      </div>

      <div className="space-y-3 p-5">
        {DEMO_TITLES.slice(0, visibleCount).map((item, i) => (
          <TitleCard key={item.title} item={item} index={i} compact showRecommended={i === 0} />
        ))}

        {visibleCount < DEMO_TITLES.length && (
          <div className="flex items-center justify-center gap-2 py-4 text-sm text-zinc-400">
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-rose-200 border-t-rose-500" />
            正在生成爆款标题…
          </div>
        )}

        {visibleCount >= DEMO_TITLES.length && (
          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={() => onTryDemo(DEMO_TOPIC, DEMO_KEYWORDS)}
              className="rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:from-rose-600 hover:to-pink-600"
            >
              用我的主题试一次 →
            </button>
            <p className="mt-2 text-xs text-zinc-400">
              填入你的主题，一键生成带评分的标题
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

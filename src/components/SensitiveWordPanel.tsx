"use client";

import type { SensitiveHit } from "@/lib/sensitive-words";
import { hasHighRisk } from "@/lib/sensitive-words";

interface SensitiveWordPanelProps {
  hitsByTitle: Map<string, SensitiveHit[]>;
  label?: string;
}

export default function SensitiveWordPanel({
  hitsByTitle,
  label = "敏感词提示",
}: SensitiveWordPanelProps) {
  if (hitsByTitle.size === 0) return null;

  const allHits = Array.from(hitsByTitle.values()).flat();
  const highRisk = hasHighRisk(allHits);

  return (
    <div
      className={`mb-4 rounded-xl border p-4 ${
        highRisk
          ? "border-orange-200 bg-orange-50/80"
          : "border-amber-100 bg-amber-50/50"
      }`}
    >
      <div>
        <p className="text-sm font-semibold text-zinc-800">
          {highRisk ? "⚠️ 检测到高风险用词" : `💡 ${label}`}
        </p>
        <p className="mt-0.5 text-xs text-zinc-500">
          以下词汇可能触发小红书限流，建议替换后再发布
        </p>
      </div>

      <div className="mt-3 space-y-2">
        {Array.from(hitsByTitle.entries()).map(([title, hits]) => (
          <div
            key={title}
            className="rounded-lg bg-white/80 px-3 py-2 border border-white"
          >
            <p className="text-xs text-zinc-600 truncate mb-1.5">{title}</p>
            <div className="flex flex-wrap gap-1.5">
              {hits.map((hit) => (
                <span
                  key={`${title}-${hit.index}-${hit.word}`}
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] ${
                    hit.severity === "high"
                      ? "bg-red-100 text-red-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                  title={`建议：${hit.suggestion}`}
                >
                  <span className="font-medium">{hit.word}</span>
                  <span className="text-zinc-400">→</span>
                  <span>{hit.suggestion.split("/")[0]?.trim()}</span>
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

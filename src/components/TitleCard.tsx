"use client";

import { useState } from "react";
import type { GeneratedTitle, TitleStyle } from "@/lib/types";

export const STYLE_COLORS: Record<TitleStyle, string> = {
  种草型: "bg-rose-100 text-rose-700",
  干货型: "bg-blue-100 text-blue-700",
  悬念型: "bg-purple-100 text-purple-700",
  数字型: "bg-amber-100 text-amber-700",
  情感型: "bg-pink-100 text-pink-700",
  对比型: "bg-teal-100 text-teal-700",
  清单型: "bg-indigo-100 text-indigo-700",
  故事型: "bg-orange-100 text-orange-700",
  热点型: "bg-red-100 text-red-700",
  提问型: "bg-cyan-100 text-cyan-700",
};

export default function TitleCard({
  item,
  index,
  compact = false,
  selected = false,
  outlineLoading = false,
  favorited = false,
  onGenerateOutline,
  onToggleFavorite,
}: {
  item: GeneratedTitle;
  index: number;
  compact?: boolean;
  selected?: boolean;
  outlineLoading?: boolean;
  favorited?: boolean;
  onGenerateOutline?: () => void;
  onToggleFavorite?: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const charCount = [...item.title].length;

  async function handleCopy() {
    await navigator.clipboard.writeText(item.title);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div
      className={`group rounded-2xl border bg-white shadow-sm transition hover:shadow-md ${
        selected
          ? "border-rose-400 ring-2 ring-rose-100"
          : "border-rose-100 hover:border-rose-200"
      } ${compact ? "p-4" : "p-5"}`}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-zinc-400">#{index + 1}</span>
        <div className="flex items-center gap-2">
          {onToggleFavorite && (
            <button
              type="button"
              onClick={onToggleFavorite}
              className={`text-lg leading-none transition ${
                favorited ? "text-amber-400" : "text-zinc-300 hover:text-amber-400"
              }`}
              aria-label={favorited ? "取消收藏" : "收藏"}
            >
              {favorited ? "★" : "☆"}
            </button>
          )}
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STYLE_COLORS[item.style]}`}
          >
            {item.style}
          </span>
        </div>
      </div>

      <p
        className={`mb-2 font-semibold leading-snug text-zinc-900 ${
          compact ? "text-base" : "text-lg"
        }`}
      >
        {item.title}
      </p>

      {!compact && (
        <p className="mb-4 text-sm text-zinc-500">{item.reason}</p>
      )}

      <div className="flex items-center justify-between gap-2">
        <span
          className={`text-xs ${charCount > 25 ? "text-orange-500" : "text-zinc-400"}`}
        >
          {charCount} 字{charCount > 25 ? "（偏长）" : ""}
        </span>
        <div className="flex gap-2">
          {!compact && onGenerateOutline && (
            <button
              type="button"
              onClick={onGenerateOutline}
              disabled={outlineLoading}
              className="rounded-lg border border-rose-200 px-3 py-1.5 text-sm font-medium text-rose-600 transition hover:bg-rose-50 disabled:opacity-50"
            >
              {outlineLoading ? "生成中…" : "写正文"}
            </button>
          )}
          <button
            type="button"
            onClick={handleCopy}
            className="rounded-lg bg-rose-50 px-3 py-1.5 text-sm font-medium text-rose-600 transition hover:bg-rose-100"
          >
            {copied ? "已复制 ✓" : "复制"}
          </button>
        </div>
      </div>
    </div>
  );
}

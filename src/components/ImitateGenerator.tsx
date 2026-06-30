"use client";

import { useCallback, useEffect, useState } from "react";
import type { GeneratedTitle } from "@/lib/types";
import { fetchUsage, type UsageInfo } from "@/lib/client-usage";
import { FREE_TITLE_COUNT, PRO_TITLE_COUNT } from "@/lib/constants";
import { recordGeneration, getTodayStats } from "@/lib/stats";
import { getFavorites, toggleFavorite } from "@/lib/favorites";
import { scanTitles } from "@/lib/sensitive-words";
import LoadingSkeleton from "./LoadingSkeleton";
import PhonePreviewModal from "./PhonePreviewModal";
import SensitiveWordPanel from "./SensitiveWordPanel";
import TitleCard from "./TitleCard";
import type { LimitReachedContext } from "./TitleGenerator";

interface ImitateGeneratorProps {
  isPro?: boolean;
  onLimitReached?: (context: LimitReachedContext) => void;
  onUsageChange?: (usage: UsageInfo) => void;
  onStatsChange?: () => void;
}

export default function ImitateGenerator({
  isPro = false,
  onLimitReached,
  onUsageChange,
  onStatsChange,
}: ImitateGeneratorProps) {
  const [referenceTitle, setReferenceTitle] = useState("");
  const [topic, setTopic] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [titles, setTitles] = useState<GeneratedTitle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [remaining, setRemaining] = useState<number | null>(null);
  const [favoriteTitles, setFavoriteTitles] = useState<Set<string>>(new Set());
  const [previewTitle, setPreviewTitle] = useState<string | null>(null);

  const titleCount = isPro ? PRO_TITLE_COUNT : FREE_TITLE_COUNT;

  const refreshUsage = useCallback(async () => {
    const usage = await fetchUsage();
    setRemaining(usage.isPro ? null : usage.remaining);
    onUsageChange?.(usage);
  }, [onUsageChange]);

  useEffect(() => {
    refreshUsage();
    setFavoriteTitles(new Set(getFavorites().map((f) => f.title)));
  }, [refreshUsage, isPro]);

  function showLimitReached(reason: "limit" | "celebrate") {
    const { count, savedMinutes } = getTodayStats();
    onLimitReached?.({ reason, usedToday: count, savedMinutes });
  }

  async function handleGenerate() {
    setError("");

    if (!referenceTitle.trim()) {
      setError("请粘贴要对标的爆款标题");
      return;
    }

    if (!isPro && remaining === 0) {
      setError("今日免费次数已用完");
      showLimitReached("limit");
      return;
    }

    setLoading(true);
    setTitles([]);
    setAnalysis("");

    try {
      const res = await fetch("/api/imitate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          referenceTitle: referenceTitle.trim(),
          topic: topic.trim(),
          count: titleCount,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 429) {
          setRemaining(0);
          showLimitReached("limit");
        }
        throw new Error(data.error || "生成失败");
      }

      const usedToday = recordGeneration();
      onStatsChange?.();

      setAnalysis(data.analysis);
      setTitles(data.titles);
      if (data.isPro) {
        setRemaining(null);
      } else {
        setRemaining(data.remaining);
        if (data.remaining === 0) {
          onLimitReached?.({
            reason: "celebrate",
            usedToday,
            savedMinutes: usedToday * 8,
          });
        }
      }
      onUsageChange?.({
        isPro: data.isPro,
        remaining: data.remaining,
        used: 0,
        limit: 10,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "生成失败，请重试");
    } finally {
      setLoading(false);
    }
  }

  function handleToggleFavorite(item: GeneratedTitle) {
    toggleFavorite(item, topic.trim() || referenceTitle.trim().slice(0, 20));
    setFavoriteTitles(new Set(getFavorites().map((f) => f.title)));
  }

  const bestScoreIndex =
    titles.length > 0
      ? titles.reduce(
          (best, t, i) =>
            (t.score ?? 0) > (titles[best].score ?? 0) ? i : best,
          0
        )
      : -1;

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="mb-6 rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50/80 to-white p-5">
        <h2 className="text-lg font-bold text-zinc-900">🎯 对标仿写</h2>
        <p className="mt-1 text-sm text-zinc-500">
          粘贴一条小红书爆款标题，AI 拆解结构并生成同套路新标题
        </p>
      </div>

      <div className="mb-8 rounded-2xl border border-rose-100 bg-white p-6 shadow-sm">
        <label className="mb-2 block text-sm font-medium text-zinc-700">
          对标爆款标题 <span className="text-rose-500">*</span>
        </label>
        <textarea
          value={referenceTitle}
          onChange={(e) => setReferenceTitle(e.target.value)}
          placeholder="粘贴你在小红书看到的爆款标题，例如：用了 3 天！这个平价好物真的绝了 ✨"
          className="mb-4 w-full rounded-xl border border-zinc-200 px-4 py-3 text-zinc-900 placeholder:text-zinc-400 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100"
          rows={2}
          maxLength={120}
        />

        <label className="mb-2 block text-sm font-medium text-zinc-700">
          你的新主题（选填）
        </label>
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="例如：平价口红、杭州探店 — 不填则保持同赛道换角度"
          className="mb-6 w-full rounded-xl border border-zinc-200 px-4 py-3 text-zinc-900 placeholder:text-zinc-400 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100"
          maxLength={100}
        />

        <button
          type="button"
          onClick={handleGenerate}
          disabled={loading}
          className="w-full rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 py-3.5 text-base font-semibold text-white shadow-md transition hover:from-violet-600 hover:to-purple-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "正在拆解并仿写…" : `🎯 仿写 ${titleCount} 条标题`}
        </button>

        {error && (
          <p className="mt-3 text-center text-sm text-red-500">{error}</p>
        )}

        <p className="mt-3 text-center text-xs text-zinc-400">
          {isPro ? (
            <span className="text-violet-600 font-medium">👑 Pro · 无限仿写</span>
          ) : (
            <>消耗 1 次额度 · 今日剩余 {remaining ?? "…"} / 10 次</>
          )}
        </p>
      </div>

      {loading && <LoadingSkeleton />}

      {analysis && (
        <div className="mb-4 rounded-xl border border-violet-100 bg-violet-50/50 px-4 py-3">
          <p className="text-xs font-semibold text-violet-600 mb-1">结构拆解</p>
          <p className="text-sm text-zinc-700">{analysis}</p>
        </div>
      )}

      {titles.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-zinc-800">仿写结果</h3>
          <SensitiveWordPanel
            hitsByTitle={scanTitles(titles.map((t) => t.title))}
          />
          {titles.map((item, i) => (
            <TitleCard
              key={`${item.title}-${i}`}
              item={item}
              index={i}
              favorited={favoriteTitles.has(item.title)}
              showRecommended={i === bestScoreIndex}
              onToggleFavorite={() => handleToggleFavorite(item)}
              onPreview={() => setPreviewTitle(item.title)}
            />
          ))}
        </div>
      )}

      <PhonePreviewModal
        open={previewTitle !== null}
        title={previewTitle || ""}
        onClose={() => setPreviewTitle(null)}
      />
    </div>
  );
}

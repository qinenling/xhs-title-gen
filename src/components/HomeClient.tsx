"use client";

import { useCallback, useEffect, useState } from "react";
import type { HistoryRecord } from "@/lib/history";
import { fetchUsage, type UsageInfo } from "@/lib/client-usage";
import FavoritesPanel from "./FavoritesPanel";
import FeatureHighlights from "./FeatureHighlights";
import HistoryPanel from "./HistoryPanel";
import ProModal from "./ProModal";
import TitleGenerator from "./TitleGenerator";

type Tab = "generate" | "history" | "favorites";

interface ApiStatus {
  mode: "live" | "demo";
  model: string | null;
  provider: string | null;
}

export default function HomeClient() {
  const [tab, setTab] = useState<Tab>("generate");
  const [proOpen, setProOpen] = useState(false);
  const [status, setStatus] = useState<ApiStatus | null>(null);
  const [usage, setUsage] = useState<UsageInfo | null>(null);
  const [restoreKey, setRestoreKey] = useState(0);
  const [restoreData, setRestoreData] = useState<{
    topic: string;
    keywords: string;
    prefillTitle?: string;
  } | null>(null);

  const refreshUsage = useCallback(async () => {
    const data = await fetchUsage();
    setUsage(data);
  }, []);

  useEffect(() => {
    fetch("/api/status")
      .then((r) => r.json())
      .then(setStatus)
      .catch(() => setStatus({ mode: "demo", model: null, provider: null }));
    refreshUsage();
  }, [refreshUsage]);

  function handleRestore(record: HistoryRecord) {
    setRestoreData({ topic: record.topic, keywords: record.keywords });
    setRestoreKey((k) => k + 1);
    setTab("generate");
  }

  function handleUseFavorite(title: string, favTopic: string) {
    setRestoreData({ topic: favTopic, keywords: "", prefillTitle: title });
    setRestoreKey((k) => k + 1);
    setTab("generate");
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-rose-100/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📕</span>
            <span className="text-lg font-bold text-rose-600">爆标题</span>
            {usage?.isPro && (
              <span className="rounded-full bg-gradient-to-r from-amber-400 to-orange-400 px-2 py-0.5 text-[10px] font-bold text-white">
                PRO
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {status && (
              <span
                className={`hidden sm:inline rounded-full px-2.5 py-1 text-xs font-medium ${
                  status.mode === "live"
                    ? "bg-green-100 text-green-700"
                    : "bg-amber-100 text-amber-700"
                }`}
                title={
                  status.mode === "live"
                    ? `${status.provider} · ${status.model}`
                    : "未配置 API Key"
                }
              >
                {status.mode === "live" ? "AI 已连接" : "演示模式"}
              </span>
            )}
            {!usage?.isPro && (
              <button
                type="button"
                onClick={() => setProOpen(true)}
                className="rounded-full bg-gradient-to-r from-rose-500 to-pink-500 px-3 py-1 text-xs font-semibold text-white shadow-sm hover:from-rose-600 hover:to-pink-600 transition"
              >
                Pro
              </button>
            )}
          </div>
        </div>

        <div className="mx-auto flex max-w-2xl gap-1 overflow-x-auto px-4 pb-0">
          {(
            [
              ["generate", "✨ 生成"],
              ["history", "📋 历史"],
              ["favorites", "⭐ 收藏"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`shrink-0 px-4 py-2.5 text-sm font-medium border-b-2 transition -mb-px ${
                tab === id
                  ? "border-rose-500 text-rose-600"
                  : "border-transparent text-zinc-400 hover:text-zinc-600"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8">
        {tab === "generate" ? (
          <>
            <div className="mb-6 text-center">
              <h1 className="mb-2 text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
                小红书爆款标题生成器
              </h1>
              <p className="text-sm text-zinc-500 sm:text-base">
                10 种风格 · 24 个选题 · 复制即用
              </p>
            </div>

            <FeatureHighlights />

            <TitleGenerator
              key={restoreKey}
              initialTopic={restoreData?.topic}
              initialKeywords={restoreData?.keywords}
              isPro={usage?.isPro ?? false}
              onLimitReached={() => setProOpen(true)}
              onUsageChange={setUsage}
            />
          </>
        ) : tab === "history" ? (
          <>
            <div className="mb-6">
              <h1 className="text-xl font-bold text-zinc-900">历史记录</h1>
              <p className="mt-1 text-sm text-zinc-500">
                本地保存，点击「重新编辑」可快速再次生成
              </p>
            </div>
            <HistoryPanel onRestore={handleRestore} />
          </>
        ) : (
          <>
            <div className="mb-6">
              <h1 className="text-xl font-bold text-zinc-900">收藏标题</h1>
              <p className="mt-1 text-sm text-zinc-500">
                生成时点 ☆ 收藏，在这里对比选用
              </p>
            </div>
            <FavoritesPanel onUseTitle={handleUseFavorite} />
          </>
        )}

        <footer className="mt-16 text-center text-xs text-zinc-400 space-y-1">
          <p>{usage?.isPro ? "Pro 会员 · 感谢支持" : "免费版每日 10 次 · Pro 版无限生成"}</p>
          <p>爆标题 · 小红书创作者效率工具</p>
        </footer>
      </main>

      <ProModal
        open={proOpen}
        onClose={() => setProOpen(false)}
        onActivated={refreshUsage}
      />
    </>
  );
}

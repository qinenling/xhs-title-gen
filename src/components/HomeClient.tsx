"use client";

import { useCallback, useEffect, useState } from "react";
import type { TitleStyle } from "@/lib/types";
import type { HistoryRecord } from "@/lib/history";
import { fetchUsage, type UsageInfo } from "@/lib/client-usage";
import { FREE_DAILY_LIMIT } from "@/lib/constants";
import { getTodayStats } from "@/lib/stats";
import CalendarPanel from "./CalendarPanel";
import FavoritesPanel from "./FavoritesPanel";
import FeatureHighlights from "./FeatureHighlights";
import HistoryPanel from "./HistoryPanel";
import ImitateGenerator from "./ImitateGenerator";
import ProModal from "./ProModal";
import TitleGenerator, { type LimitReachedContext } from "./TitleGenerator";
import UpgradePromptModal from "./UpgradePromptModal";

type Tab = "generate" | "imitate" | "calendar" | "history" | "favorites";

interface ApiStatus {
  mode: "live" | "demo";
  model: string | null;
  provider: string | null;
}

export default function HomeClient() {
  const [tab, setTab] = useState<Tab>("generate");
  const [proOpen, setProOpen] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [upgradeContext, setUpgradeContext] = useState<LimitReachedContext>({
    reason: "limit",
    usedToday: 0,
    savedMinutes: 0,
  });
  const [status, setStatus] = useState<ApiStatus | null>(null);
  const [usage, setUsage] = useState<UsageInfo | null>(null);
  const [savedMinutes, setSavedMinutes] = useState(0);
  const [restoreKey, setRestoreKey] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);
  const [restoreData, setRestoreData] = useState<{
    topic: string;
    keywords: string;
    prefillTitle?: string;
    prefillStyle?: TitleStyle;
  } | null>(null);

  const refreshStats = useCallback(() => {
    setSavedMinutes(getTodayStats().savedMinutes);
  }, []);

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
    refreshStats();
  }, [refreshUsage, refreshStats]);

  function handleLimitReached(context: LimitReachedContext) {
    setUpgradeContext(context);
    setUpgradeOpen(true);
  }

  function handleRestore(record: HistoryRecord) {
    setRestoreData({ topic: record.topic, keywords: record.keywords });
    setRestoreKey((k) => k + 1);
    setTab("generate");
  }

  function handleUseFavorite(title: string, favTopic: string, style: TitleStyle) {
    setRestoreData({
      topic: favTopic,
      keywords: "",
      prefillTitle: title,
      prefillStyle: style,
    });
    setRestoreKey((k) => k + 1);
    setTab("generate");
  }

  function handleUseCalendarTopic(topic: string) {
    setRestoreData({ topic, keywords: "" });
    setRestoreKey((k) => k + 1);
    setTab("generate");
  }

  async function handleShareSite() {
    const url =
      process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
      (typeof window !== "undefined" ? window.location.origin : "https://baotitle.asia");
    await navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
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
                PRO{usage.isLifetime !== false ? " · 永久" : ""}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {savedMinutes > 0 && !usage?.isPro && (
              <span className="hidden sm:inline text-[10px] text-zinc-400">
                今日已省 ~{savedMinutes} 分钟
              </span>
            )}
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
              ["imitate", "🎯 仿写"],
              ["calendar", "📅 日历"],
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
              {id === "calendar" && !usage?.isPro && (
                <span className="ml-0.5 text-[9px] text-amber-500">Pro</span>
              )}
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
                爆款指数 · 手机预览 · 敏感词检测
              </p>
            </div>

            <FeatureHighlights />

            <TitleGenerator
              key={restoreKey}
              initialTopic={restoreData?.topic}
              initialKeywords={restoreData?.keywords}
              initialPrefillTitle={restoreData?.prefillTitle}
              initialPrefillStyle={restoreData?.prefillStyle}
              isPro={usage?.isPro ?? false}
              onLimitReached={handleLimitReached}
              onUsageChange={setUsage}
              onStatsChange={refreshStats}
            />
          </>
        ) : tab === "imitate" ? (
          <>
            <div className="mb-6 text-center">
              <h1 className="mb-2 text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
                对标爆款仿写
              </h1>
              <p className="text-sm text-zinc-500 sm:text-base">
                粘贴爆款标题，AI 拆解结构并生成同套路新标题
              </p>
            </div>
            <ImitateGenerator
              isPro={usage?.isPro ?? false}
              onLimitReached={handleLimitReached}
              onUsageChange={setUsage}
              onStatsChange={refreshStats}
            />
          </>
        ) : tab === "calendar" ? (
          <>
            <div className="mb-6 text-center">
              <h1 className="mb-2 text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
                7 日选题日历
              </h1>
              <p className="text-sm text-zinc-500 sm:text-base">
                Pro 专属 · 规划一周内容，日更不再愁
              </p>
            </div>
            <CalendarPanel
              isPro={usage?.isPro ?? false}
              onUpgrade={() => setProOpen(true)}
              onUseTopic={handleUseCalendarTopic}
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

        <footer className="mt-16 text-center text-xs text-zinc-400 space-y-2">
          <p>
            {usage?.isPro
              ? "Pro 永久会员 · 感谢支持"
              : `免费版每日 ${FREE_DAILY_LIMIT} 次 · Pro 永久买断无限生成`}
          </p>
          <p>爆标题 · baotitle.asia · 小红书创作者效率工具</p>
          <button
            type="button"
            onClick={handleShareSite}
            className="text-rose-400 hover:text-rose-600 hover:underline"
          >
            {copiedLink ? "链接已复制 ✓" : "复制网站链接分享给好友"}
          </button>
        </footer>
      </main>

      <UpgradePromptModal
        open={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        onUpgrade={() => setProOpen(true)}
        usedToday={upgradeContext.usedToday}
        savedMinutes={upgradeContext.savedMinutes}
        reason={upgradeContext.reason}
      />

      <ProModal
        open={proOpen}
        onClose={() => setProOpen(false)}
        onActivated={refreshUsage}
      />
    </>
  );
}

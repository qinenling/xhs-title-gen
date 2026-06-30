"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { GeneratedTitle, NoteOutline, TitleStyle } from "@/lib/types";
import { TITLE_STYLES, DEFAULT_STYLES } from "@/lib/types";
import { saveToHistory } from "@/lib/history";
import { fetchUsage, type UsageInfo } from "@/lib/client-usage";
import { FREE_TITLE_COUNT, PRO_TITLE_COUNT } from "@/lib/constants";
import { exportMarkdown, exportTitlesCsv, outlineToText } from "@/lib/format";
import { getFavorites, toggleFavorite } from "@/lib/favorites";
import { recordGeneration, getTodayStats } from "@/lib/stats";
import { scanTitles } from "@/lib/sensitive-words";
import LoadingSkeleton from "./LoadingSkeleton";
import OutlinePanel from "./OutlinePanel";
import PhonePreviewModal from "./PhonePreviewModal";
import SensitiveWordPanel from "./SensitiveWordPanel";
import TitleCard from "./TitleCard";
import TopicTemplates from "./TopicTemplates";
import CompareModal from "./CompareModal";
import DemoPreview from "./DemoPreview";

export interface LimitReachedContext {
  reason: "limit" | "celebrate";
  usedToday: number;
  savedMinutes: number;
}

interface TitleGeneratorProps {
  initialTopic?: string;
  initialKeywords?: string;
  initialPrefillTitle?: string;
  initialPrefillStyle?: TitleStyle;
  isPro?: boolean;
  onLimitReached?: (context: LimitReachedContext) => void;
  onUsageChange?: (usage: UsageInfo) => void;
  onStatsChange?: () => void;
}

export default function TitleGenerator({
  initialTopic = "",
  initialKeywords = "",
  initialPrefillTitle = "",
  initialPrefillStyle,
  isPro = false,
  onLimitReached,
  onUsageChange,
  onStatsChange,
}: TitleGeneratorProps) {
  const [topic, setTopic] = useState(initialTopic);
  const [keywords, setKeywords] = useState(initialKeywords);
  const [styles, setStyles] = useState<TitleStyle[]>([...DEFAULT_STYLES]);
  const [titles, setTitles] = useState<GeneratedTitle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [remaining, setRemaining] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [showDemo, setShowDemo] = useState(true);

  const [outline, setOutline] = useState<NoteOutline | null>(null);
  const [outlineTitle, setOutlineTitle] = useState("");
  const [outlineLoadingIndex, setOutlineLoadingIndex] = useState<number | null>(
    null
  );
  const [fullPackLoading, setFullPackLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [exported, setExported] = useState(false);
  const [mdExported, setMdExported] = useState(false);
  const [favoriteTitles, setFavoriteTitles] = useState<Set<string>>(new Set());
  const [previewTitle, setPreviewTitle] = useState<string | null>(null);
  const [previewCover, setPreviewCover] = useState<string | undefined>();
  const [comparePick, setComparePick] = useState<number[]>([]);
  const [compareOpen, setCompareOpen] = useState(false);
  const [csvExported, setCsvExported] = useState(false);

  const formRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const prefillHandled = useRef(false);
  const outlineHandlerRef = useRef<
    ((item: GeneratedTitle, index: number) => Promise<void>) | null
  >(null);

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

  useEffect(() => {
    if (initialTopic) setTopic(initialTopic);
    if (initialKeywords) setKeywords(initialKeywords);
  }, [initialTopic, initialKeywords]);

  function toggleComparePick(index: number) {
    setComparePick((prev) => {
      if (prev.includes(index)) return prev.filter((i) => i !== index);
      if (prev.length >= 2) return [prev[1], index];
      return [...prev, index];
    });
  }

  function showLimitReached(reason: "limit" | "celebrate") {
    const { count, savedMinutes } = getTodayStats();
    onLimitReached?.({ reason, usedToday: count, savedMinutes });
  }

  function toggleStyle(style: TitleStyle) {
    setStyles((prev) => {
      if (prev.includes(style)) {
        if (prev.length <= 1) return prev;
        return prev.filter((s) => s !== style);
      }
      return [...prev, style];
    });
  }

  function applyTemplate(t: string, k: string) {
    setTopic(t);
    setKeywords(k);
    setOutline(null);
    setSelectedIndex(null);
    setShowDemo(false);
  }

  function handleTryDemo(t: string, k: string) {
    setTopic(t);
    setKeywords(k);
    setShowDemo(false);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function handleLimitError(res: Response, data: { error?: string }) {
    if (res.status === 429) {
      setRemaining(0);
      showLimitReached("limit");
    }
    throw new Error(data.error || "请求失败");
  }

  async function runGenerate(clearPrevious: boolean) {
    setError("");
    setShowDemo(false);

    if (!topic.trim()) {
      setError("请先填写笔记主题");
      return;
    }

    if (!isPro && remaining === 0) {
      setError("今日免费次数已用完");
      showLimitReached("limit");
      return;
    }

    setLoading(true);
    if (clearPrevious) {
      setTitles([]);
      setOutline(null);
      setSelectedIndex(null);
    }

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: topic.trim(),
          keywords: keywords.trim(),
          styles,
          count: titleCount,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        handleLimitError(res, data);
      }

      const usedToday = recordGeneration();
      onStatsChange?.();

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
      saveToHistory(topic.trim(), keywords.trim(), data.titles);

      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : "生成失败，请重试");
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerateOutline(item: GeneratedTitle, index: number) {
    setError("");

    if (!isPro && remaining === 0) {
      setError("今日免费次数已用完");
      showLimitReached("limit");
      return;
    }

    setOutlineLoadingIndex(index);
    setSelectedIndex(index);
    setOutline(null);

    try {
      const res = await fetch("/api/outline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: topic.trim(),
          keywords: keywords.trim(),
          title: item.title,
          style: item.style,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        handleLimitError(res, data);
      }

      const usedToday = recordGeneration();
      onStatsChange?.();

      setOutline(data.outline);
      setOutlineTitle(item.title);
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "大纲生成失败，请重试");
      setSelectedIndex(null);
    } finally {
      setOutlineLoadingIndex(null);
      setFullPackLoading(false);
    }
  }

  outlineHandlerRef.current = handleGenerateOutline;

  useEffect(() => {
    if (!initialPrefillTitle || prefillHandled.current) return;
    if (!isPro && remaining === null) return;

    prefillHandled.current = true;
    const item: GeneratedTitle = {
      title: initialPrefillTitle,
      style: initialPrefillStyle || "干货型",
      reason: "来自收藏",
      score: 0,
    };
    setTitles([item]);
    setShowDemo(false);
    void outlineHandlerRef.current?.(item, 0);
  }, [initialPrefillTitle, initialPrefillStyle, isPro, remaining]);

  async function handleFullPack() {
    if (titles.length === 0) return;

    const bestIndex = titles.reduce(
      (best, t, i) => ((t.score ?? 0) > (titles[best].score ?? 0) ? i : best),
      0
    );

    setFullPackLoading(true);
    await handleGenerateOutline(titles[bestIndex], bestIndex);
  }

  async function handleCopyAll() {
    const text = titles
      .map(
        (t, i) =>
          `${i + 1}. [${t.score ?? "-"}分·${t.style}] ${t.title}`
      )
      .join("\n");
    await navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  }

  async function handleExportMarkdown() {
    const md = exportMarkdown(
      topic.trim(),
      keywords.trim(),
      titles,
      outline,
      outlineTitle
    );
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `爆标题-${topic.trim().slice(0, 10) || "笔记"}.md`;
    a.click();
    URL.revokeObjectURL(url);
    setMdExported(true);
    setTimeout(() => setMdExported(false), 2000);
  }

  function handleToggleFavorite(item: GeneratedTitle) {
    toggleFavorite(item, topic.trim());
    setFavoriteTitles(new Set(getFavorites().map((f) => f.title)));
  }

  async function handleExportPackage() {
    if (!outline) return;
    const text = outlineToText(outline, outlineTitle);
    const allTitles = titles
      .map((t, i) => `${i + 1}. [${t.score ?? "-"}分·${t.style}] ${t.title}`)
      .join("\n");
    const pack = `【备选标题】\n${allTitles}\n\n【正文】\n${text}`;
    await navigator.clipboard.writeText(pack);
    setExported(true);
    setTimeout(() => setExported(false), 2000);
  }

  function handleExportCsv() {
    const csv = exportTitlesCsv(topic.trim(), titles);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `爆标题-${topic.trim().slice(0, 10) || "笔记"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setCsvExported(true);
    setTimeout(() => setCsvExported(false), 2000);
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
      {showDemo && titles.length === 0 && !loading && (
        <DemoPreview onTryDemo={handleTryDemo} />
      )}

      <div
        ref={formRef}
        className="mb-8 rounded-2xl border border-rose-100 bg-white p-6 shadow-sm"
      >
        <TopicTemplates onSelect={applyTemplate} />

        <label className="mb-2 block text-sm font-medium text-zinc-700">
          笔记主题 <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="例如：平价 skincare 入门、周末杭州两日游"
          className="mb-4 w-full rounded-xl border border-zinc-200 px-4 py-3 text-zinc-900 placeholder:text-zinc-400 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100"
          maxLength={100}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !loading) runGenerate(true);
          }}
        />

        <label className="mb-2 block text-sm font-medium text-zinc-700">
          关键词 / 卖点（选填）
        </label>
        <input
          type="text"
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
          placeholder="例如：学生党、百元内、油皮友好"
          className="mb-4 w-full rounded-xl border border-zinc-200 px-4 py-3 text-zinc-900 placeholder:text-zinc-400 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100"
          maxLength={80}
        />

        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm font-medium text-zinc-700">标题风格</label>
          <div className="flex gap-2 text-xs">
            <button
              type="button"
              onClick={() => setStyles([...DEFAULT_STYLES])}
              className="text-rose-500 hover:underline"
            >
              常用5种
            </button>
            <button
              type="button"
              onClick={() => setStyles([...TITLE_STYLES])}
              className="text-zinc-400 hover:text-rose-500 hover:underline"
            >
              全选10种
            </button>
          </div>
        </div>
        <div className="mb-6 flex flex-wrap gap-2">
          {TITLE_STYLES.map((style) => {
            const active = styles.includes(style);
            return (
              <button
                key={style}
                type="button"
                onClick={() => toggleStyle(style)}
                className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
                  active
                    ? "bg-rose-500 text-white shadow-sm"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                }`}
              >
                {style}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => runGenerate(true)}
          disabled={loading}
          className="w-full rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 py-3.5 text-base font-semibold text-white shadow-md transition hover:from-rose-600 hover:to-pink-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading
            ? "正在生成爆款标题…"
            : `✨ 生成 ${titleCount} 条标题（含爆款指数）`}
        </button>

        {error && (
          <p className="mt-3 text-center text-sm text-red-500">{error}</p>
        )}

        <p className="mt-3 text-center text-xs text-zinc-400">
          {isPro ? (
            <span className="text-rose-500 font-medium">👑 Pro 永久 · 无限生成</span>
          ) : (
            <>
              今日剩余：{remaining ?? "…"} / 10 次
              {remaining !== null && remaining <= 3 && remaining > 0 && (
                <button
                  type="button"
                  onClick={() => showLimitReached("limit")}
                  className="ml-2 text-rose-500 hover:underline"
                >
                  升级 Pro
                </button>
              )}
            </>
          )}
        </p>
      </div>

      {loading && titles.length === 0 && <LoadingSkeleton />}

      {titles.length > 0 && (
        <div ref={resultsRef}>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-zinc-800">生成结果</h2>
              <p className="text-xs text-zinc-400">按爆款指数从高到低排序</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleFullPack}
                disabled={fullPackLoading || outlineLoadingIndex !== null}
                className="rounded-lg bg-gradient-to-r from-violet-500 to-purple-500 px-3 py-1.5 text-sm font-medium text-white hover:from-violet-600 hover:to-purple-600 transition disabled:opacity-50"
              >
                {fullPackLoading ? "生成中…" : "📦 一键完整笔记包"}
              </button>
              <button
                type="button"
                onClick={handleExportCsv}
                className="rounded-lg border border-emerald-200 px-3 py-1.5 text-sm font-medium text-emerald-700 hover:bg-emerald-50 transition"
              >
                {csvExported ? "已导出 ✓" : "📊 导出 CSV"}
              </button>
              <button
                type="button"
                onClick={handleCopyAll}
                className="rounded-lg border border-rose-200 px-3 py-1.5 text-sm font-medium text-rose-600 hover:bg-rose-50 transition"
              >
                {copiedAll ? "已复制全部 ✓" : "复制全部"}
              </button>
              <button
                type="button"
                onClick={() => runGenerate(true)}
                disabled={loading}
                className="rounded-lg bg-zinc-100 px-3 py-1.5 text-sm font-medium text-zinc-600 hover:bg-zinc-200 transition disabled:opacity-50"
              >
                换一批
              </button>
            </div>
          </div>

          <p className="mb-4 text-sm text-zinc-500">
            「完整笔记包」自动选用爆款指数最高的标题，生成大纲 + 标签 + 首评话术
          </p>

          <SensitiveWordPanel
            hitsByTitle={scanTitles(titles.map((t) => t.title))}
          />

          {comparePick.length > 0 && (
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-blue-50 border border-blue-100 px-4 py-3">
              <p className="text-sm text-blue-700">
                已选 {comparePick.length}/2 条标题用于 A/B 对比
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setComparePick([])}
                  className="text-xs text-zinc-500 hover:text-zinc-700"
                >
                  清空
                </button>
                <button
                  type="button"
                  disabled={comparePick.length < 2}
                  onClick={() => setCompareOpen(true)}
                  className="rounded-lg bg-blue-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-600 disabled:opacity-50"
                >
                  查看对比
                </button>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {titles.map((item, i) => (
              <TitleCard
                key={`${item.title}-${i}`}
                item={item}
                index={i}
                selected={selectedIndex === i}
                outlineLoading={outlineLoadingIndex === i}
                favorited={favoriteTitles.has(item.title)}
                showRecommended={i === bestScoreIndex}
                compareSelected={comparePick.includes(i)}
                onCompareToggle={() => toggleComparePick(i)}
                onToggleFavorite={() => handleToggleFavorite(item)}
                onGenerateOutline={() => handleGenerateOutline(item, i)}
                onPreview={() => {
                  setPreviewTitle(item.title);
                  setPreviewCover(outline?.coverText);
                }}
              />
            ))}
          </div>

          {outline && (
            <>
              <div className="mt-4 flex flex-wrap justify-end gap-2">
                <button
                  type="button"
                  onClick={handleExportMarkdown}
                  className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50 transition"
                >
                  {mdExported ? "已下载 Markdown ✓" : "📄 导出 Markdown"}
                </button>
                <button
                  type="button"
                  onClick={handleExportPackage}
                  className="rounded-lg bg-violet-50 px-4 py-2 text-sm font-medium text-violet-600 hover:bg-violet-100 transition"
                >
                  {exported ? "已复制全套素材 ✓" : "📦 复制全套（标题+正文）"}
                </button>
              </div>
              <OutlinePanel
                outline={outline}
                title={outlineTitle}
                onClose={() => {
                  setOutline(null);
                  setSelectedIndex(null);
                }}
              />
            </>
          )}
        </div>
      )}

      <PhonePreviewModal
        open={previewTitle !== null}
        title={previewTitle || ""}
        coverText={
          previewTitle === outlineTitle ? outline?.coverText : previewCover
        }
        onClose={() => setPreviewTitle(null)}
      />

      <CompareModal
        open={compareOpen}
        titleA={
          comparePick[0] !== undefined ? titles[comparePick[0]] ?? null : null
        }
        titleB={
          comparePick[1] !== undefined ? titles[comparePick[1]] ?? null : null
        }
        onClose={() => setCompareOpen(false)}
      />
    </div>
  );
}

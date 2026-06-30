"use client";

import { useState } from "react";
import type { CalendarDay } from "@/lib/types";
import { STYLE_COLORS } from "./TitleCard";

const PREVIEW_DAYS: CalendarDay[] = [
  { day: 1, topic: "新手入门必看清单", suggestedStyle: "清单型", hook: "降低门槛，适合吸粉" },
  { day: 2, topic: "真实踩坑经历分享", suggestedStyle: "故事型", hook: "共鸣感强，评论量高" },
  { day: 3, topic: "3 个实用小技巧", suggestedStyle: "干货型", hook: "收藏率高" },
];

interface CalendarPanelProps {
  isPro: boolean;
  onUpgrade: () => void;
  onUseTopic: (topic: string) => void;
}

export default function CalendarPanel({
  isPro,
  onUpgrade,
  onUseTopic,
}: CalendarPanelProps) {
  const [niche, setNiche] = useState("");
  const [keywords, setKeywords] = useState("");
  const [days, setDays] = useState<CalendarDay[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  async function handleGenerate() {
    setError("");

    if (!isPro) {
      onUpgrade();
      return;
    }

    if (!niche.trim()) {
      setError("请填写内容赛道");
      return;
    }

    setLoading(true);
    setDays([]);

    try {
      const res = await fetch("/api/calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          niche: niche.trim(),
          keywords: keywords.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 403) onUpgrade();
        throw new Error(data.error || "生成失败");
      }

      setDays(data.days);
    } catch (err) {
      setError(err instanceof Error ? err.message : "生成失败，请重试");
    } finally {
      setLoading(false);
    }
  }

  async function handleCopyAll() {
    const text = days
      .map(
        (d) =>
          `Day ${d.day} · ${d.topic}\n  风格：${d.suggestedStyle} · ${d.hook}`
      )
      .join("\n\n");
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const weekdayLabels = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="mb-6 rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50/80 to-white p-5">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-zinc-900">📅 7 日选题日历</h2>
          <span className="rounded-full bg-gradient-to-r from-amber-400 to-orange-400 px-2 py-0.5 text-[10px] font-bold text-white">
            PRO
          </span>
        </div>
        <p className="mt-1 text-sm text-zinc-500">
          输入赛道，AI 规划一周不重复的图文选题
        </p>
      </div>

      {!isPro && days.length === 0 && (
        <div className="mb-6 rounded-2xl border border-dashed border-amber-200 bg-amber-50/30 p-4">
          <p className="text-xs font-semibold text-amber-700 mb-3">示例预览（Pro 可生成完整 7 天）</p>
          <div className="space-y-2 opacity-80">
            {PREVIEW_DAYS.map((day, i) => (
              <div key={day.day} className="rounded-xl bg-white/90 px-3 py-2 border border-amber-100">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-bold text-amber-600">Day {day.day}</span>
                  <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${STYLE_COLORS[day.suggestedStyle]}`}>
                    {day.suggestedStyle}
                  </span>
                </div>
                <p className="text-sm font-medium text-zinc-800 mt-0.5">{day.topic}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mb-8 rounded-2xl border border-rose-100 bg-white p-6 shadow-sm">
        <label className="mb-2 block text-sm font-medium text-zinc-700">
          内容赛道 <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          value={niche}
          onChange={(e) => setNiche(e.target.value)}
          placeholder="例如：美妆种草、职场干货、探店美食"
          className="mb-4 w-full rounded-xl border border-zinc-200 px-4 py-3 text-zinc-900 placeholder:text-zinc-400 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
          maxLength={50}
        />

        <label className="mb-2 block text-sm font-medium text-zinc-700">
          补充说明（选填）
        </label>
        <input
          type="text"
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
          placeholder="例如：面向学生党、偏平价、日更"
          className="mb-6 w-full rounded-xl border border-zinc-200 px-4 py-3 text-zinc-900 placeholder:text-zinc-400 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
          maxLength={80}
        />

        <button
          type="button"
          onClick={handleGenerate}
          disabled={loading}
          className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 py-3.5 text-base font-semibold text-white shadow-md transition hover:from-amber-600 hover:to-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading
            ? "正在规划 7 日选题…"
            : isPro
              ? "📅 生成 7 日选题日历"
              : "🔒 升级 Pro 解锁"}
        </button>

        {error && (
          <p className="mt-3 text-center text-sm text-red-500">{error}</p>
        )}

        {!isPro && (
          <p className="mt-3 text-center text-xs text-zinc-400">
            Pro 专属 ·{" "}
            <button
              type="button"
              onClick={onUpgrade}
              className="text-rose-500 hover:underline"
            >
              了解 Pro →
            </button>
          </p>
        )}
      </div>

      {days.length > 0 && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-zinc-800">本周选题</h3>
            <button
              type="button"
              onClick={handleCopyAll}
              className="rounded-lg border border-amber-200 px-3 py-1.5 text-sm font-medium text-amber-700 hover:bg-amber-50 transition"
            >
              {copied ? "已复制 ✓" : "复制全部"}
            </button>
          </div>

          <div className="space-y-3">
            {days.map((day, i) => (
              <div
                key={day.day}
                className="rounded-2xl border border-amber-100 bg-white p-4 shadow-sm hover:border-amber-200 transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-700">
                        {day.day}
                      </span>
                      <span className="text-xs text-zinc-400">
                        {weekdayLabels[i] || `第 ${day.day} 天`}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${STYLE_COLORS[day.suggestedStyle]}`}
                      >
                        {day.suggestedStyle}
                      </span>
                    </div>
                    <p className="font-semibold text-zinc-900">{day.topic}</p>
                    <p className="mt-1 text-sm text-zinc-500">{day.hook}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onUseTopic(day.topic)}
                    className="shrink-0 rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-100 transition"
                  >
                    去生成
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

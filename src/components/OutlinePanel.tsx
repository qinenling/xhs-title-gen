"use client";

import { useState, useMemo, useEffect } from "react";
import type { NoteOutline } from "@/lib/types";
import { outlineToText } from "@/lib/format";
import {
  mergeSensitiveHits,
  scanOutlineText,
  scanSensitiveText,
  type AiSensitiveHit,
} from "@/lib/sensitive-words";
import SensitiveWordPanel from "./SensitiveWordPanel";
import PhonePreview from "./PhonePreview";

interface OutlinePanelProps {
  outline: NoteOutline;
  title: string;
  onClose: () => void;
}

export default function OutlinePanel({
  outline,
  title,
  onClose,
}: OutlinePanelProps) {
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [aiHits, setAiHits] = useState<AiSensitiveHit[]>([]);
  const [aiLoading, setAiLoading] = useState(false);

  const fullText = useMemo(
    () => outlineToText(outline, title),
    [outline, title]
  );

  const ruleParts = useMemo(
    () => [
      { label: "标题", text: title },
      { label: "开头", text: outline.opening },
      ...outline.sections.flatMap((s) => [
        { label: s.heading, text: s.heading },
        { label: s.heading, text: s.content },
      ]),
      { label: "结尾", text: outline.closing },
      { label: "封面文案", text: outline.coverText },
      { label: "首评", text: outline.firstComment },
      { label: "互动话术", text: outline.interactionHook },
    ],
    [outline, title]
  );

  const sensitiveMap = useMemo(() => {
    const base = scanOutlineText(ruleParts);
    if (aiHits.length === 0) return base;

    const aiMerged = mergeSensitiveHits(
      scanSensitiveText(fullText),
      aiHits
    );
    if (aiMerged.length > 0) {
      base.set("🤖 AI 深度检测补充", aiMerged);
    }
    return base;
  }, [ruleParts, aiHits, fullText]);

  useEffect(() => {
    let cancelled = false;
    setAiLoading(true);
    setAiHits([]);

    fetch("/api/sensitive-scan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: fullText }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setAiHits(data.hits || []);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setAiLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [fullText]);

  async function handleCopy() {
    await navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="mt-6 rounded-2xl border border-rose-200 bg-gradient-to-b from-rose-50/80 to-white p-6 shadow-sm">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-zinc-900">📝 正文大纲</h3>
          <p className="mt-1 text-sm text-zinc-500 truncate max-w-xs sm:max-w-md">
            基于：{title}
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-600 hover:bg-zinc-50 transition"
          >
            {showPreview ? "收起预览" : "📱 预览"}
          </button>
          <button
            type="button"
            onClick={handleCopy}
            className="rounded-lg bg-rose-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-rose-600 transition"
          >
            {copied ? "已复制 ✓" : "复制全文"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1.5 text-sm text-zinc-400 hover:text-zinc-600 transition"
          >
            ✕
          </button>
        </div>
      </div>

      {showPreview && (
        <div className="mb-5 flex justify-center rounded-xl bg-zinc-50 py-4">
          <PhonePreview title={title} coverText={outline.coverText} />
        </div>
      )}

      {aiLoading && (
        <p className="mb-3 text-xs text-zinc-400 text-center">🤖 AI 正在深度检测敏感词…</p>
      )}

      <SensitiveWordPanel
        hitsByTitle={sensitiveMap}
        label="正文敏感词检测（规则 + AI）"
      />

      <div className="space-y-4">
        <section className="rounded-xl bg-white p-4 border border-rose-100">
          <p className="text-xs font-semibold text-rose-500 mb-2">开头钩子</p>
          <p className="text-sm leading-relaxed text-zinc-700 whitespace-pre-line">
            {outline.opening}
          </p>
        </section>

        {outline.sections.map((section, i) => (
          <section
            key={i}
            className="rounded-xl bg-white p-4 border border-rose-100"
          >
            <p className="text-sm font-semibold text-zinc-800 mb-2">
              {i + 1}. {section.heading}
            </p>
            <p className="text-sm leading-relaxed text-zinc-600 whitespace-pre-line">
              {section.content}
            </p>
          </section>
        ))}

        <section className="rounded-xl bg-white p-4 border border-rose-100">
          <p className="text-xs font-semibold text-rose-500 mb-2">结尾互动</p>
          <p className="text-sm leading-relaxed text-zinc-700">
            {outline.closing}
          </p>
        </section>

        <section className="rounded-xl bg-white p-4 border border-rose-100">
          <p className="text-xs font-semibold text-rose-500 mb-2">推荐标签</p>
          <div className="flex flex-wrap gap-2">
            {outline.hashtags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-rose-100 px-2.5 py-1 text-xs font-medium text-rose-700"
              >
                #{tag.replace(/^#/, "")}
              </span>
            ))}
          </div>
        </section>

        <section className="rounded-xl bg-amber-50 p-4 border border-amber-100">
          <p className="text-xs font-semibold text-amber-700 mb-1">📷 配图建议</p>
          <p className="text-sm text-amber-900/80">{outline.imageTips}</p>
        </section>

        {(outline.coverText || outline.firstComment || outline.interactionHook) && (
          <section className="rounded-xl bg-violet-50 p-4 border border-violet-100 space-y-3">
            <p className="text-xs font-semibold text-violet-600">📦 完整笔记包</p>
            {outline.coverText && (
              <div>
                <p className="text-[10px] font-medium text-violet-500 mb-0.5">封面文案</p>
                <p className="text-sm font-semibold text-zinc-800">{outline.coverText}</p>
              </div>
            )}
            {outline.firstComment && (
              <div>
                <p className="text-[10px] font-medium text-violet-500 mb-0.5">首评引导</p>
                <p className="text-sm text-zinc-700">{outline.firstComment}</p>
              </div>
            )}
            {outline.interactionHook && (
              <div>
                <p className="text-[10px] font-medium text-violet-500 mb-0.5">互动话术</p>
                <p className="text-sm text-zinc-700">{outline.interactionHook}</p>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}

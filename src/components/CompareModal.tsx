"use client";

import PhonePreview from "./PhonePreview";
import type { GeneratedTitle } from "@/lib/types";

interface CompareModalProps {
  open: boolean;
  titleA: GeneratedTitle | null;
  titleB: GeneratedTitle | null;
  onClose: () => void;
}

export default function CompareModal({
  open,
  titleA,
  titleB,
  onClose,
}: CompareModalProps) {
  if (!open || !titleA || !titleB) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 text-center">
          <h3 className="text-lg font-bold text-zinc-900">⚖️ 标题 A/B 对比</h3>
          <p className="mt-1 text-xs text-zinc-500">并排预览信息流效果，选更适合的一条</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {[titleA, titleB].map((item, i) => (
            <div key={item.title} className="rounded-xl border border-rose-100 bg-rose-50/30 p-3">
              <p className="mb-2 text-center text-xs font-bold text-rose-600">
                方案 {i === 0 ? "A" : "B"} · {item.score} 分
              </p>
              <PhonePreview title={item.title} compact />
              <p className="mt-3 text-sm font-semibold text-zinc-800 leading-snug">
                {item.title}
              </p>
              <p className="mt-1 text-[10px] text-zinc-400">{item.style}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-xl bg-zinc-50 p-3 text-xs text-zinc-600">
          <p>
            <strong>A</strong> {titleA.score >= titleB.score ? "↑ 指数更高" : ""} · {titleA.title.length} 字
          </p>
          <p className="mt-1">
            <strong>B</strong> {titleB.score > titleA.score ? "↑ 指数更高" : ""} · {titleB.title.length} 字
          </p>
          <p className="mt-2 text-zinc-400">
            推荐：{titleA.score >= titleB.score ? "方案 A" : "方案 B"}
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full rounded-xl bg-zinc-100 py-2.5 text-sm font-medium text-zinc-600 hover:bg-zinc-200"
        >
          关闭
        </button>
      </div>
    </div>
  );
}

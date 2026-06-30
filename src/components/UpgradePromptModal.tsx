"use client";

import { FREE_DAILY_LIMIT, PRO_PRICE_LABEL } from "@/lib/constants";

interface UpgradePromptModalProps {
  open: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  usedToday: number;
  savedMinutes: number;
  reason?: "limit" | "celebrate";
}

export default function UpgradePromptModal({
  open,
  onClose,
  onUpgrade,
  usedToday,
  savedMinutes,
  reason = "limit",
}: UpgradePromptModalProps) {
  if (!open) return null;

  const isCelebrate = reason === "celebrate" && usedToday > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center">
          <span className="text-5xl">{isCelebrate ? "🎉" : "⏰"}</span>
          <h3 className="mt-3 text-xl font-bold text-zinc-900">
            {isCelebrate ? "今天效率拉满了！" : "今日免费次数已用完"}
          </h3>
          <p className="mt-2 text-sm text-zinc-500">
            {isCelebrate
              ? `你已生成 ${usedToday} 次，相当于节省约 ${savedMinutes} 分钟`
              : `免费版每日 ${FREE_DAILY_LIMIT} 次，明天 0 点重置`}
          </p>
        </div>

        <div className="mt-5 rounded-xl bg-gradient-to-br from-rose-50 to-amber-50 p-4">
          <p className="text-center text-sm font-medium text-zinc-700">
            升级 Pro，永久无限创作
          </p>
          <ul className="mt-3 space-y-2 text-sm text-zinc-600">
            <li className="flex items-center gap-2">
              <span className="text-rose-500">✓</span> 无限生成 · 一次 10 条标题
            </li>
            <li className="flex items-center gap-2">
              <span className="text-rose-500">✓</span> 对标仿写 · 完整笔记包
            </li>
            <li className="flex items-center gap-2">
              <span className="text-rose-500">✓</span> 7 日选题日历 · 手机预览
            </li>
          </ul>
          <div className="mt-3 text-center">
            <span className="text-2xl font-bold text-rose-600">{PRO_PRICE_LABEL}</span>
            <span className="text-zinc-500 text-sm ml-1">永久买断</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            onClose();
            onUpgrade();
          }}
          className="mt-5 w-full rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 py-3.5 text-sm font-semibold text-white transition hover:from-rose-600 hover:to-pink-600"
        >
          立即升级 Pro →
        </button>

        <button
          type="button"
          onClick={onClose}
          className="mt-3 w-full py-2 text-sm text-zinc-400 hover:text-zinc-600 transition"
        >
          {isCelebrate ? "明天再来" : "稍后再说"}
        </button>
      </div>
    </div>
  );
}

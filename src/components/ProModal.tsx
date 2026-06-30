"use client";

import { useState } from "react";

interface ProModalProps {
  open: boolean;
  onClose: () => void;
  onActivated: () => void;
}

export default function ProModal({ open, onClose, onActivated }: ProModalProps) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const contactWechat =
    process.env.NEXT_PUBLIC_CONTACT_WECHAT || "请配置微信号";

  if (!open) return null;

  async function handleActivate() {
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch("/api/pro/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "激活失败");
      }

      setSuccess(data.message);
      setCode("");
      onActivated();
      setTimeout(() => onClose(), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "激活失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center mb-5">
          <span className="text-4xl">👑</span>
          <h3 className="mt-3 text-xl font-bold text-zinc-900">升级 Pro 版</h3>
          <p className="mt-2 text-sm text-zinc-500">
            无限生成 · 一次 10 条标题 · 正文大纲不限
          </p>
        </div>

        <div className="rounded-xl bg-gradient-to-br from-rose-50 to-pink-50 p-4 mb-5">
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-3xl font-bold text-rose-600">¥49</span>
            <span className="text-zinc-500">/月</span>
          </div>
          <ul className="mt-4 space-y-2 text-sm text-zinc-600">
            <li className="flex items-center gap-2">
              <span className="text-rose-500">✓</span> 无限次标题 + 大纲生成
            </li>
            <li className="flex items-center gap-2">
              <span className="text-rose-500">✓</span> 一次生成 10 条标题
            </li>
            <li className="flex items-center gap-2">
              <span className="text-rose-500">✓</span> 优先体验新功能
            </li>
          </ul>
        </div>

        <div className="mb-4">
          <p className="mb-2 text-sm font-medium text-zinc-700">
            已有激活码？输入即可开通
          </p>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.trim())}
            autoComplete="off"
            spellCheck={false}
            className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100"
          />
          {error && (
            <p className="mt-2 text-sm text-red-500">{error}</p>
          )}
          {success && (
            <p className="mt-2 text-sm text-green-600">{success}</p>
          )}
          <button
            type="button"
            onClick={handleActivate}
            disabled={loading || !code.trim()}
            className="mt-3 w-full rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 py-3 text-sm font-semibold text-white transition hover:from-rose-600 hover:to-pink-600 disabled:opacity-50"
          >
            {loading ? "激活中…" : "激活 Pro"}
          </button>
        </div>

        <div className="rounded-xl border border-zinc-100 bg-zinc-50 p-4 text-center">
          <p className="text-sm font-medium text-zinc-700">购买 Pro</p>
          <p className="mt-1 text-xs text-zinc-500">
            如需购买激活码，请添加微信：
            <span className="font-mono text-rose-600"> {contactWechat}</span>
          </p>
          <p className="mt-1 text-xs text-zinc-400">付款后 5 分钟内发卡</p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full py-2 text-sm text-zinc-400 hover:text-zinc-600 transition"
        >
          关闭
        </button>
      </div>
    </div>
  );
}

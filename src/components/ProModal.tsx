"use client";

import { useState } from "react";
import { PRO_IS_LIFETIME, PRO_PRICE_LABEL } from "@/lib/constants";

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
  const [copiedWechat, setCopiedWechat] = useState(false);
  const [showFaq, setShowFaq] = useState(false);

  const contactWechat = process.env.NEXT_PUBLIC_CONTACT_WECHAT || "";
  const wechatOnline = contactWechat && contactWechat !== "未上线";

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

      setSuccess(
        data.isLifetime
          ? "Pro 已永久激活！此设备上无限使用"
          : data.message || "Pro 已激活！"
      );
      setCode("");
      onActivated();
      setTimeout(() => onClose(), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "激活失败");
    } finally {
      setLoading(false);
    }
  }

  async function handleCopyWechat() {
    if (!wechatOnline) return;
    await navigator.clipboard.writeText(contactWechat);
    setCopiedWechat(true);
    setTimeout(() => setCopiedWechat(false), 2000);
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
            一次买断 · 永久使用 · 无限生成
          </p>
        </div>

        <div className="rounded-xl bg-gradient-to-br from-rose-50 to-pink-50 p-4 mb-5">
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-3xl font-bold text-rose-600">{PRO_PRICE_LABEL}</span>
            <span className="text-zinc-500 text-sm">买断</span>
          </div>
          <p className="mt-1 text-center text-xs text-rose-500 font-medium">
            {PRO_IS_LIFETIME ? "激活后永久有效，无需续费" : ""}
          </p>
          <ul className="mt-4 space-y-2 text-sm text-zinc-600">
            <li className="flex items-center gap-2">
              <span className="text-rose-500">✓</span> 无限次标题 + 大纲 + 仿写
            </li>
            <li className="flex items-center gap-2">
              <span className="text-rose-500">✓</span> 一次 10 条 · 爆款指数排序
            </li>
            <li className="flex items-center gap-2">
              <span className="text-rose-500">✓</span> 7 日选题日历 · 完整笔记包
            </li>
            <li className="flex items-center gap-2">
              <span className="text-rose-500">✓</span> 手机预览 · 敏感词检测
            </li>
          </ul>
        </div>

        <div className="mb-4">
          <p className="mb-2 text-sm font-medium text-zinc-700">
            已有激活码？输入即可永久开通
          </p>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.trim())}
            autoComplete="off"
            spellCheck={false}
            placeholder="粘贴激活码"
            className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100"
          />
          {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
          {success && <p className="mt-2 text-sm text-green-600">{success}</p>}
          <button
            type="button"
            onClick={handleActivate}
            disabled={loading || !code.trim()}
            className="mt-3 w-full rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 py-3 text-sm font-semibold text-white transition hover:from-rose-600 hover:to-pink-600 disabled:opacity-50"
          >
            {loading ? "激活中…" : "激活 Pro（永久）"}
          </button>
        </div>

        <button
          type="button"
          onClick={() => setShowFaq(!showFaq)}
          className="mb-3 w-full text-left text-xs text-zinc-500 hover:text-zinc-700"
        >
          {showFaq ? "▾" : "▸"} 手机 / 电脑都能用吗？
        </button>
        {showFaq && (
          <div className="mb-4 rounded-xl bg-zinc-50 p-3 text-xs text-zinc-600 space-y-2 leading-relaxed">
            <p>
              <strong className="text-zinc-800">激活码</strong>
              ：手机微信、电脑浏览器均可输入同一个码激活。
            </p>
            <p>
              <strong className="text-zinc-800">Pro 状态</strong>
              ：保存在当前浏览器，<strong className="text-zinc-800">永久有效</strong>
              。换设备时在新区重新输入激活码即可（同一码可多次激活不同设备）。
            </p>
          </div>
        )}

        <div className="rounded-xl border border-zinc-100 bg-zinc-50 p-4 text-center">
          <p className="text-sm font-medium text-zinc-700">购买 Pro</p>
          {wechatOnline ? (
            <>
              <p className="mt-2 text-sm text-zinc-600">
                微信号：
                <span className="font-semibold text-zinc-800">{contactWechat}</span>
              </p>
              <p className="mt-1 text-xs text-zinc-400">
                添加微信 → 转账 {PRO_PRICE_LABEL} 备注「Pro」→ 收到激活码
              </p>
              <button
                type="button"
                onClick={handleCopyWechat}
                className="mt-3 rounded-lg bg-white border border-rose-200 px-4 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 transition"
              >
                {copiedWechat ? "已复制微信号 ✓" : "复制微信号"}
              </button>
            </>
          ) : (
            <p className="mt-2 text-xs text-zinc-400">
              微信购买通道即将开放，请先联系管理员获取激活码
            </p>
          )}
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

"use client";

import { useEffect, useState } from "react";

const DISMISS_KEY = "pwa-install-dismissed";

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in window.navigator &&
      (window.navigator as Navigator & { standalone?: boolean }).standalone ===
        true)
  );
}

function isMobile(): boolean {
  if (typeof window === "undefined") return false;
  return /Android|iPhone|iPad|iPod/i.test(window.navigator.userAgent);
}

function isIOS(): boolean {
  if (typeof window === "undefined") return false;
  return /iPhone|iPad|iPod/i.test(window.navigator.userAgent);
}

export default function InstallPrompt() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isStandalone() || !isMobile()) return;
    if (localStorage.getItem(DISMISS_KEY)) return;
    setVisible(true);
  }, []);

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, "1");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <div className="mx-auto max-w-lg rounded-2xl border border-rose-200 bg-white/95 p-4 shadow-lg backdrop-blur">
        <div className="flex items-start gap-3">
          <span className="text-2xl" aria-hidden>
            📲
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-zinc-900">添加到主屏幕</p>
            <p className="mt-1 text-sm text-zinc-600">
              {isIOS()
                ? "点击 Safari 底部分享按钮，选择「添加到主屏幕」，像 App 一样打开。"
                : "点击浏览器菜单，选择「添加到主屏幕」或「安装应用」，下次打开更快。"}
            </p>
          </div>
          <button
            type="button"
            onClick={dismiss}
            className="shrink-0 rounded-lg px-2 py-1 text-sm text-zinc-500 hover:bg-zinc-100"
            aria-label="关闭"
          >
            ✕
          </button>
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="mt-3 w-full rounded-xl bg-rose-500 py-2.5 text-sm font-medium text-white hover:bg-rose-600"
        >
          知道了
        </button>
      </div>
    </div>
  );
}

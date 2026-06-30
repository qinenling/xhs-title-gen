"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN) {
      Sentry.captureException(error);
    }
  }, [error]);

  return (
    <html lang="zh-CN">
      <body className="flex min-h-screen flex-col items-center justify-center bg-rose-50 px-4 text-center">
        <p className="text-4xl">😵</p>
        <h1 className="mt-4 text-xl font-semibold text-zinc-900">页面出错了</h1>
        <p className="mt-2 max-w-sm text-sm text-zinc-600">
          请刷新页面重试。若问题持续，请联系客服。
        </p>
        <button
          type="button"
          onClick={() => reset()}
          className="mt-6 rounded-xl bg-rose-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-rose-600"
        >
          重新加载
        </button>
      </body>
    </html>
  );
}

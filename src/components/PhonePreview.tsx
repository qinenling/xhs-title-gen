"use client";

import { truncateFeedTitle } from "@/lib/sensitive-words";

interface PhonePreviewProps {
  title: string;
  coverText?: string;
  nickname?: string;
  compact?: boolean;
}

export default function PhonePreview({
  title,
  coverText,
  nickname = "小红薯博主",
  compact = false,
}: PhonePreviewProps) {
  const feedTitle = truncateFeedTitle(title);
  const isTruncated = feedTitle !== title;
  const displayCover = coverText || title.slice(0, 8);

  if (compact) {
    return (
      <div className="mx-auto w-[140px]">
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100 shadow-md">
          <div className="aspect-[3/4] bg-gradient-to-br from-rose-100 via-pink-50 to-amber-50 p-2 flex items-end">
            <p className="text-[8px] font-bold leading-tight text-zinc-800 line-clamp-3">
              {displayCover}
            </p>
          </div>
          <div className="bg-white px-2 py-1.5">
            <p className="text-[9px] font-medium text-zinc-800 line-clamp-2 leading-snug">
              {feedTitle}
            </p>
            <div className="mt-1 flex items-center gap-1">
              <div className="h-3 w-3 rounded-full bg-rose-200" />
              <span className="text-[7px] text-zinc-400 truncate">{nickname}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-[260px]">
      <div className="overflow-hidden rounded-[2rem] border-[3px] border-zinc-800 bg-zinc-900 shadow-xl">
        {/* 状态栏 */}
        <div className="flex items-center justify-between bg-white px-4 py-1.5">
          <span className="text-[10px] font-semibold text-zinc-800">9:41</span>
          <div className="h-4 w-16 rounded-full bg-zinc-900" />
          <div className="flex gap-0.5">
            <div className="h-2 w-2 rounded-sm bg-zinc-800" />
            <div className="h-2 w-3 rounded-sm bg-zinc-800" />
          </div>
        </div>

        {/* 发现页顶栏 */}
        <div className="flex items-center gap-3 bg-white px-3 py-2 border-b border-zinc-100">
          <span className="text-xs text-zinc-400">关注</span>
          <span className="text-xs font-bold text-zinc-900 border-b-2 border-rose-500 pb-0.5">
            发现
          </span>
          <span className="text-xs text-zinc-400">附近</span>
        </div>

        {/* 双列信息流 */}
        <div className="grid grid-cols-2 gap-1.5 bg-zinc-50 p-1.5">
          {/* 当前笔记卡片 */}
          <div className="overflow-hidden rounded-lg bg-white shadow-sm ring-2 ring-rose-400 ring-offset-1">
            <div className="aspect-[3/4] bg-gradient-to-br from-rose-100 via-pink-50 to-amber-50 p-2 flex flex-col justify-end">
              <p className="text-[10px] font-bold leading-tight text-zinc-800">
                {displayCover}
              </p>
            </div>
            <div className="p-1.5">
              <p className="text-[10px] font-medium text-zinc-800 line-clamp-2 leading-snug">
                {feedTitle}
              </p>
              <div className="mt-1 flex items-center gap-1">
                <div className="h-3.5 w-3.5 rounded-full bg-gradient-to-br from-rose-300 to-pink-400" />
                <span className="text-[8px] text-zinc-400 truncate">{nickname}</span>
              </div>
            </div>
          </div>

          {/* 占位卡片 */}
          <div className="overflow-hidden rounded-lg bg-white opacity-60">
            <div className="aspect-[3/4] bg-gradient-to-br from-blue-50 to-indigo-50" />
            <div className="p-1.5">
              <div className="h-2 w-full rounded bg-zinc-100 mb-1" />
              <div className="h-2 w-2/3 rounded bg-zinc-100" />
            </div>
          </div>
        </div>

        {/* 笔记详情预览 */}
        <div className="bg-white border-t border-zinc-100 px-3 py-2">
          <p className="text-[9px] font-semibold text-rose-500 mb-1">笔记详情预览</p>
          <p className="text-[11px] font-semibold text-zinc-900 leading-snug">{title}</p>
          {isTruncated && (
            <p className="mt-1 text-[8px] text-amber-600">
              ⚠ 信息流中标题会被截断，详情页才显示完整
            </p>
          )}
        </div>

        {/* 底栏 */}
        <div className="flex justify-around bg-white border-t border-zinc-100 py-2">
          {["首页", "购物", "＋", "消息", "我"].map((label) => (
            <span
              key={label}
              className={`text-[9px] ${label === "首页" ? "text-zinc-900 font-medium" : "text-zinc-400"}`}
            >
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

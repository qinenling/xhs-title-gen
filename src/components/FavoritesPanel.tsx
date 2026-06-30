"use client";

import { useEffect, useState } from "react";
import type { FavoriteTitle } from "@/lib/favorites";
import {
  clearFavorites,
  getFavorites,
  removeFavorite,
} from "@/lib/favorites";
import type { TitleStyle } from "@/lib/types";
import TitleCard from "./TitleCard";

interface FavoritesPanelProps {
  onUseTitle: (title: string, topic: string, style: TitleStyle) => void;
}

export default function FavoritesPanel({ onUseTitle }: FavoritesPanelProps) {
  const [items, setItems] = useState<FavoriteTitle[]>([]);

  function refresh() {
    setItems(getFavorites());
  }

  useEffect(() => {
    refresh();
  }, []);

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-rose-200 bg-white/60 py-16 text-center">
        <p className="text-4xl mb-3">⭐</p>
        <p className="text-zinc-600 font-medium">还没有收藏的标题</p>
        <p className="mt-1 text-sm text-zinc-400">
          生成标题后点 ☆ 收藏，方便对比选用
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-500">共 {items.length} 条收藏</p>
        <button
          type="button"
          onClick={() => {
            if (!confirm("确定清空全部收藏？")) return;
            clearFavorites();
            refresh();
          }}
          className="text-sm text-zinc-400 hover:text-red-500 transition"
        >
          清空全部
        </button>
      </div>

      {items.map((item, i) => (
        <div key={item.id} className="relative">
          <TitleCard item={item} index={i} compact />
          <div className="mt-2 flex gap-2 px-1">
            <button
              type="button"
              onClick={() => onUseTitle(item.title, item.topic, item.style)}
              className="rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-100 transition"
            >
              用这个标题写正文
            </button>
            <button
              type="button"
              onClick={() => {
                removeFavorite(item.id);
                refresh();
              }}
              className="rounded-lg px-3 py-1.5 text-xs text-zinc-400 hover:text-red-500 transition"
            >
              取消收藏
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

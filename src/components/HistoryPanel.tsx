"use client";

import { useEffect, useState } from "react";
import type { HistoryRecord } from "@/lib/history";
import {
  clearHistory,
  deleteHistoryRecord,
  formatHistoryTime,
  getHistory,
} from "@/lib/history";
import TitleCard from "./TitleCard";

interface HistoryPanelProps {
  onRestore: (record: HistoryRecord) => void;
}

export default function HistoryPanel({ onRestore }: HistoryPanelProps) {
  const [records, setRecords] = useState<HistoryRecord[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  function refresh() {
    setRecords(getHistory());
  }

  useEffect(() => {
    refresh();
  }, []);

  function handleDelete(id: string) {
    deleteHistoryRecord(id);
    if (expandedId === id) setExpandedId(null);
    refresh();
  }

  function handleClearAll() {
    if (!confirm("确定清空全部历史记录？")) return;
    clearHistory();
    setExpandedId(null);
    refresh();
  }

  if (records.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-rose-200 bg-white/60 py-16 text-center">
        <p className="text-4xl mb-3">📋</p>
        <p className="text-zinc-600 font-medium">还没有历史记录</p>
        <p className="mt-1 text-sm text-zinc-400">
          生成标题后会自动保存在这里
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-500">共 {records.length} 条记录</p>
        <button
          type="button"
          onClick={handleClearAll}
          className="text-sm text-zinc-400 hover:text-red-500 transition"
        >
          清空全部
        </button>
      </div>

      {records.map((record) => {
        const expanded = expandedId === record.id;
        return (
          <div
            key={record.id}
            className="rounded-2xl border border-rose-100 bg-white overflow-hidden shadow-sm"
          >
            <div className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-zinc-900 truncate">
                    {record.topic}
                  </p>
                  {record.keywords && (
                    <p className="mt-0.5 text-sm text-zinc-400 truncate">
                      {record.keywords}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-zinc-400">
                    {formatHistoryTime(record.createdAt)} · {record.titles.length} 条标题
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={() => onRestore(record)}
                    className="rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-100 transition"
                  >
                    重新编辑
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedId(expanded ? null : record.id)
                    }
                    className="rounded-lg bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-200 transition"
                  >
                    {expanded ? "收起" : "查看"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(record.id)}
                    className="rounded-lg px-2 py-1.5 text-xs text-zinc-400 hover:text-red-500 transition"
                    aria-label="删除"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>

            {expanded && (
              <div className="border-t border-rose-50 bg-rose-50/30 p-4 space-y-3">
                {record.titles.map((item, i) => (
                  <TitleCard
                    key={`${record.id}-${i}`}
                    item={item}
                    index={i}
                    compact
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

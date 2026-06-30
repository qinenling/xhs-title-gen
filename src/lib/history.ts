import type { GeneratedTitle } from "./types";

export interface HistoryRecord {
  id: string;
  topic: string;
  keywords: string;
  titles: GeneratedTitle[];
  createdAt: string;
}

const STORAGE_KEY = "xhs-title-gen-history";
const MAX_RECORDS = 30;

export function getHistory(): HistoryRecord[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const records = JSON.parse(raw) as HistoryRecord[];
    return Array.isArray(records) ? records : [];
  } catch {
    return [];
  }
}

export function saveToHistory(
  topic: string,
  keywords: string,
  titles: GeneratedTitle[]
): HistoryRecord {
  const record: HistoryRecord = {
    id: crypto.randomUUID(),
    topic,
    keywords,
    titles,
    createdAt: new Date().toISOString(),
  };

  const prev = getHistory();
  const next = [record, ...prev].slice(0, MAX_RECORDS);

  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  return record;
}

export function deleteHistoryRecord(id: string): void {
  const next = getHistory().filter((r) => r.id !== id);
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }
}

export function clearHistory(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export function formatHistoryTime(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "刚刚";
  if (diffMin < 60) return `${diffMin} 分钟前`;

  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} 小时前`;

  return date.toLocaleDateString("zh-CN", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

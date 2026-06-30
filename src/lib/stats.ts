const STORAGE_KEY = "xhs-title-gen-stats";
const MINUTES_PER_GEN = 8;

interface DayStats {
  date: string;
  count: number;
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function readStats(): DayStats {
  if (typeof window === "undefined") {
    return { date: todayKey(), count: 0 };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { date: todayKey(), count: 0 };
    const parsed = JSON.parse(raw) as DayStats;
    if (parsed.date !== todayKey()) {
      return { date: todayKey(), count: 0 };
    }
    return parsed;
  } catch {
    return { date: todayKey(), count: 0 };
  }
}

function writeStats(stats: DayStats): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
}

/** 记录一次成功生成（标题/大纲/仿写均计入） */
export function recordGeneration(): number {
  const stats = readStats();
  stats.count += 1;
  writeStats(stats);
  return stats.count;
}

export function getTodayStats(): { count: number; savedMinutes: number } {
  const stats = readStats();
  return {
    count: stats.count,
    savedMinutes: stats.count * MINUTES_PER_GEN,
  };
}

export function getScoreLabel(score: number): string {
  if (score >= 90) return "爆款潜力";
  if (score >= 80) return "点击潜力高";
  if (score >= 70) return "中规中矩";
  return "可再优化";
}

function getBarColor(score: number): string {
  if (score >= 90) return "bg-gradient-to-r from-rose-500 to-orange-500";
  if (score >= 80) return "bg-gradient-to-r from-rose-400 to-pink-400";
  if (score >= 70) return "bg-gradient-to-r from-amber-400 to-yellow-400";
  return "bg-gradient-to-r from-zinc-300 to-zinc-400";
}

function getTextColor(score: number): string {
  if (score >= 90) return "text-rose-600";
  if (score >= 80) return "text-rose-500";
  if (score >= 70) return "text-amber-600";
  return "text-zinc-500";
}

interface ViralScoreBarProps {
  score: number;
  compact?: boolean;
  showDetail?: boolean;
}

export default function ViralScoreBar({
  score,
  compact = false,
  showDetail = true,
}: ViralScoreBarProps) {
  const label = getScoreLabel(score);
  const textColor = getTextColor(score);

  if (compact) {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold ${textColor}`}
      >
        {score} 分
      </span>
    );
  }

  return (
    <div className="mb-3">
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-zinc-500">爆款指数</span>
          <span className={`text-sm font-bold ${textColor}`}>{score}</span>
        </div>
        {showDetail && (
          <span className={`text-xs font-medium ${textColor}`}>{label}</span>
        )}
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-100">
        <div
          className={`h-full rounded-full transition-all duration-500 ${getBarColor(score)}`}
          style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
        />
      </div>
    </div>
  );
}

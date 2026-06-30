export interface UsageInfo {
  isPro: boolean;
  remaining: number;
  used: number;
  limit: number | null;
}

export async function fetchUsage(): Promise<UsageInfo> {
  const res = await fetch("/api/usage", { cache: "no-store" });
  if (!res.ok) {
    return { isPro: false, remaining: 10, used: 0, limit: 10 };
  }
  return res.json();
}

import { FREE_DAILY_LIMIT } from "./constants";

export interface UsageInfo {
  isPro: boolean;
  isLifetime?: boolean;
  remaining: number;
  used: number;
  limit: number | null;
  expiresAt?: number | null;
}

export async function fetchUsage(): Promise<UsageInfo> {
  const res = await fetch("/api/usage", { cache: "no-store" });
  if (!res.ok) {
    return {
      isPro: false,
      isLifetime: false,
      remaining: FREE_DAILY_LIMIT,
      used: 0,
      limit: FREE_DAILY_LIMIT,
      expiresAt: null,
    };
  }
  return res.json();
}

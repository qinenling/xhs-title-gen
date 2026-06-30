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
      remaining: 10,
      used: 0,
      limit: 10,
      expiresAt: null,
    };
  }
  return res.json();
}

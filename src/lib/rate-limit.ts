import { FREE_DAILY_LIMIT } from "./constants";

interface DayUsage {
  date: string;
  count: number;
}

const store = new Map<string, DayUsage>();

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip") || "unknown";
}

function getRecord(key: string): DayUsage {
  const today = todayKey();
  const existing = store.get(key);

  if (!existing || existing.date !== today) {
    const fresh = { date: today, count: 0 };
    store.set(key, fresh);
    return fresh;
  }

  return existing;
}

export function getUsageSnapshot(
  request: Request,
  isPro: boolean
): { used: number; remaining: number; limit: number } {
  if (isPro) {
    return { used: 0, remaining: 999, limit: FREE_DAILY_LIMIT };
  }

  const key = getClientIp(request);
  const record = getRecord(key);

  return {
    used: record.count,
    remaining: Math.max(0, FREE_DAILY_LIMIT - record.count),
    limit: FREE_DAILY_LIMIT,
  };
}

export function consumeUsage(
  request: Request,
  isPro: boolean
): { allowed: boolean; remaining: number } {
  if (isPro) {
    return { allowed: true, remaining: 999 };
  }

  const key = getClientIp(request);
  const record = getRecord(key);

  if (record.count >= FREE_DAILY_LIMIT) {
    return { allowed: false, remaining: 0 };
  }

  record.count += 1;
  store.set(key, record);

  return {
    allowed: true,
    remaining: Math.max(0, FREE_DAILY_LIMIT - record.count),
  };
}

const ACTIVATE_DAILY_LIMIT = 10;
const activateStore = new Map<string, DayUsage>();

function getActivateRecord(key: string): DayUsage {
  const today = todayKey();
  const existing = activateStore.get(key);

  if (!existing || existing.date !== today) {
    const fresh = { date: today, count: 0 };
    activateStore.set(key, fresh);
    return fresh;
  }

  return existing;
}

/** 激活码尝试次数限制，防暴力试码 */
export function consumeActivateAttempt(
  request: Request
): { allowed: boolean } {
  const key = `activate:${getClientIp(request)}`;
  const record = getActivateRecord(key);

  if (record.count >= ACTIVATE_DAILY_LIMIT) {
    return { allowed: false };
  }

  record.count += 1;
  activateStore.set(key, record);
  return { allowed: true };
}

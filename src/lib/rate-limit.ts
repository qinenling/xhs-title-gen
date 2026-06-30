import { FREE_DAILY_LIMIT } from "./constants";
import { isRedisEnabled, redisGet, redisIncr } from "./redis";

interface DayUsage {
  date: string;
  count: number;
}

const store = new Map<string, DayUsage>();
const activateStore = new Map<string, DayUsage>();

const ACTIVATE_DAILY_LIMIT = 10;
const KEY_TTL_SEC = 48 * 60 * 60;

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip") || "unknown";
}

function memoryGet(map: Map<string, DayUsage>, key: string): DayUsage {
  const today = todayKey();
  const existing = map.get(key);
  if (!existing || existing.date !== today) {
    const fresh = { date: today, count: 0 };
    map.set(key, fresh);
    return fresh;
  }
  return existing;
}

async function getCount(prefix: string, ip: string): Promise<number> {
  if (isRedisEnabled()) {
    const raw = await redisGet(`${prefix}:${todayKey()}:${ip}`);
    return raw ? parseInt(raw, 10) || 0 : 0;
  }
  const map = prefix === "usage" ? store : activateStore;
  return memoryGet(map, ip).count;
}

async function increment(prefix: string, ip: string): Promise<number> {
  if (isRedisEnabled()) {
    return redisIncr(`${prefix}:${todayKey()}:${ip}`, KEY_TTL_SEC);
  }
  const map = prefix === "usage" ? store : activateStore;
  const record = memoryGet(map, ip);
  record.count += 1;
  map.set(ip, record);
  return record.count;
}

export async function getUsageSnapshot(
  request: Request,
  isPro: boolean
): Promise<{ used: number; remaining: number; limit: number }> {
  if (isPro) {
    return { used: 0, remaining: 999, limit: FREE_DAILY_LIMIT };
  }

  const ip = getClientIp(request);
  const used = await getCount("usage", ip);

  return {
    used,
    remaining: Math.max(0, FREE_DAILY_LIMIT - used),
    limit: FREE_DAILY_LIMIT,
  };
}

export async function consumeUsage(
  request: Request,
  isPro: boolean
): Promise<{ allowed: boolean; remaining: number }> {
  if (isPro) {
    return { allowed: true, remaining: 999 };
  }

  const ip = getClientIp(request);
  const used = await getCount("usage", ip);

  if (used >= FREE_DAILY_LIMIT) {
    return { allowed: false, remaining: 0 };
  }

  const newCount = await increment("usage", ip);

  return {
    allowed: true,
    remaining: Math.max(0, FREE_DAILY_LIMIT - newCount),
  };
}

/** 激活码尝试次数限制，防暴力试码 */
export async function consumeActivateAttempt(
  request: Request
): Promise<{ allowed: boolean }> {
  const ip = getClientIp(request);
  const used = await getCount("activate", ip);

  if (used >= ACTIVATE_DAILY_LIMIT) {
    return { allowed: false };
  }

  await increment("activate", ip);
  return { allowed: true };
}

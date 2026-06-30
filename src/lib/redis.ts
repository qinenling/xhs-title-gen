/**
 * 可选 Upstash Redis：配置后用于持久化免费次数 / 激活尝试限制
 * UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN
 */

function configured(): boolean {
  return !!(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  );
}

function headers(): HeadersInit {
  return {
    Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
  };
}

function url(path: string): string {
  const base = process.env.UPSTASH_REDIS_REST_URL!.replace(/\/$/, "");
  return `${base}${path}`;
}

export function isRedisEnabled(): boolean {
  return configured();
}

export async function redisGet(key: string): Promise<string | null> {
  if (!configured()) return null;
  const res = await fetch(url(`/get/${encodeURIComponent(key)}`), {
    headers: headers(),
    cache: "no-store",
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { result?: string | null };
  return data.result ?? null;
}

export async function redisIncr(key: string, ttlSec: number): Promise<number> {
  if (!configured()) return 0;
  const res = await fetch(url(`/incr/${encodeURIComponent(key)}`), {
    method: "POST",
    headers: headers(),
    cache: "no-store",
  });
  if (!res.ok) return 0;
  const data = (await res.json()) as { result?: number };
  const count = data.result ?? 0;
  if (count === 1) {
    await fetch(url(`/expire/${encodeURIComponent(key)}/${ttlSec}`), {
      method: "POST",
      headers: headers(),
      cache: "no-store",
    });
  }
  return count;
}

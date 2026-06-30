import { createHmac, timingSafeEqual } from "crypto";
import { PRO_IS_LIFETIME } from "./constants";

export {
  FREE_DAILY_LIMIT,
  PRO_TITLE_COUNT,
  FREE_TITLE_COUNT,
  PRO_IS_LIFETIME,
  PRO_PRICE,
  PRO_PRICE_LABEL,
} from "./constants";

const COOKIE_NAME = "xhs_pro";
const TOKEN_PAYLOAD = "pro-v1";

/** 约 10 年，等同永久（浏览器 Cookie 上限内尽量长） */
const COOKIE_MAX_AGE_SEC = 10 * 365 * 24 * 60 * 60;

function getSecret(): string {
  return process.env.PRO_SECRET || "dev-change-me-in-production";
}

/** 旧版固定 token（向后兼容） */
export function generateProToken(): string {
  return createHmac("sha256", getSecret()).update(TOKEN_PAYLOAD).digest("hex");
}

function signV2(expiresAtMs: number): string {
  return createHmac("sha256", getSecret())
    .update(`pro-v2:${expiresAtMs}`)
    .digest("hex");
}

export function generateProCookieValue(
  expiresAtMs = Date.now() + COOKIE_MAX_AGE_SEC * 1000
): string {
  return `${expiresAtMs}.${signV2(expiresAtMs)}`;
}

function getProCookieValue(request: Request): string | null {
  const cookieHeader = request.headers.get("cookie") || "";
  const match = cookieHeader.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function verifyV2Cookie(token: string): number | null {
  const dot = token.indexOf(".");
  if (dot <= 0) return null;

  const expiresAtMs = Number(token.slice(0, dot));
  const sig = token.slice(dot + 1);

  if (!Number.isFinite(expiresAtMs) || !sig) return null;
  if (expiresAtMs <= Date.now()) return null;

  const expected = signV2(expiresAtMs);
  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length) return null;
    if (!timingSafeEqual(a, b)) return null;
    return expiresAtMs;
  } catch {
    return null;
  }
}

function verifyLegacyCookie(token: string): boolean {
  const expected = generateProToken();
  try {
    const a = Buffer.from(token);
    const b = Buffer.from(expected);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function getProExpiry(request: Request): number | null {
  if (PRO_IS_LIFETIME) return null;

  const token = getProCookieValue(request);
  if (!token) return null;

  const v2 = verifyV2Cookie(token);
  if (v2) return v2;

  if (verifyLegacyCookie(token)) {
    return Date.now() + COOKIE_MAX_AGE_SEC * 1000;
  }

  return null;
}

export function isProUser(request: Request): boolean {
  const token = getProCookieValue(request);
  if (!token) return false;

  if (verifyV2Cookie(token)) return true;
  return verifyLegacyCookie(token);
}

export function validateLicenseCode(code: string): boolean {
  const codes = (process.env.PRO_LICENSE_CODES || "")
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);

  if (codes.length === 0) return false;
  return codes.includes(code.trim());
}

export const PRO_COOKIE = {
  name: COOKIE_NAME,
  maxAge: COOKIE_MAX_AGE_SEC,
};

export function getProCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: PRO_COOKIE.maxAge,
    path: "/",
  };
}

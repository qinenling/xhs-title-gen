import { createHmac, timingSafeEqual } from "crypto";
import { FREE_DAILY_LIMIT } from "./constants";

export { FREE_DAILY_LIMIT, PRO_TITLE_COUNT, FREE_TITLE_COUNT } from "./constants";

const COOKIE_NAME = "xhs_pro";
const TOKEN_PAYLOAD = "pro-v1";

function getSecret(): string {
  return process.env.PRO_SECRET || "dev-change-me-in-production";
}

export function generateProToken(): string {
  return createHmac("sha256", getSecret()).update(TOKEN_PAYLOAD).digest("hex");
}

function getProCookieValue(request: Request): string | null {
  const cookieHeader = request.headers.get("cookie") || "";
  const match = cookieHeader.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function isProUser(request: Request): boolean {
  const token = getProCookieValue(request);
  if (!token) return false;

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
  maxAge: 30 * 24 * 60 * 60,
};

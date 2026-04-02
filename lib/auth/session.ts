import { cookies } from "next/headers";
import crypto from "crypto";

const COOKIE_NAME = "stuffie_session";
const ONE_YEAR = 60 * 60 * 24 * 365;

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is not set");
  return secret;
}

function sign(token: string): string {
  const sig = crypto
    .createHmac("sha256", getSecret())
    .update(token)
    .digest("hex");
  return `${token}.${sig}`;
}

function verify(value: string): boolean {
  const dot = value.lastIndexOf(".");
  if (dot === -1) return false;
  const token = value.slice(0, dot);
  const expected = sign(token);
  return crypto.timingSafeEqual(
    Buffer.from(value),
    Buffer.from(expected)
  );
}

export function createSessionCookie(): string {
  const token = crypto.randomBytes(32).toString("hex");
  return sign(token);
}

export function buildCookieOptions() {
  return {
    name: COOKIE_NAME,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: ONE_YEAR,
  };
}

export async function isTrusted(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const cookie = cookieStore.get(COOKIE_NAME);
    if (!cookie?.value) return false;
    return verify(cookie.value);
  } catch {
    return false;
  }
}

export function isValidSessionValue(value: string | undefined): boolean {
  if (!value) return false;
  try {
    return verify(value);
  } catch {
    return false;
  }
}

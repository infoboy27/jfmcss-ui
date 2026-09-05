import crypto from "node:crypto";

export const SESSION_COOKIE = "jfmcss_session";
export const SESSION_TTL_S = 7 * 24 * 60 * 60; // 7 días

function secretKey(): Buffer {
  const s = process.env.SESSION_SECRET || process.env.ADMIN_PASSWORD || "";
  return crypto.createHash("sha256").update(`jfmcss-session:${s}`).digest();
}

function sign(payload: string): string {
  return crypto.createHmac("sha256", secretKey()).update(payload).digest("hex");
}

export function isConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD);
}

export function checkPassword(input: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  const a = crypto.createHash("sha256").update(input).digest();
  const b = crypto.createHash("sha256").update(expected).digest();
  return crypto.timingSafeEqual(a, b);
}

export function createSessionToken(): string {
  const exp = Date.now() + SESSION_TTL_S * 1000;
  return `${exp}.${sign(String(exp))}`;
}

export function verifySessionToken(token: string | undefined): boolean {
  if (!token || !isConfigured()) return false;
  const [expStr, sig] = token.split(".");
  if (!expStr || !sig) return false;
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || exp < Date.now()) return false;
  try {
    return crypto.timingSafeEqual(
      Buffer.from(sig, "hex"),
      Buffer.from(sign(expStr), "hex"),
    );
  } catch {
    return false;
  }
}

import { NextRequest, NextResponse } from "next/server";
import {
  checkPassword,
  createSessionToken,
  isConfigured,
  SESSION_COOKIE,
  SESSION_TTL_S,
} from "@/lib/auth";

export const dynamic = "force-dynamic";

// throttle simple por IP: máx 8 intentos por ventana de 10 minutos
const WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 8;
const attempts = new Map<string, { count: number; resetAt: number }>();

function clientIp(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
}

export async function POST(req: NextRequest) {
  if (!isConfigured()) {
    return NextResponse.json(
      { ok: false, error: "ADMIN_PASSWORD no está configurado en el servidor" },
      { status: 503 },
    );
  }

  const ip = clientIp(req);
  const now = Date.now();
  const a = attempts.get(ip);
  if (a && a.resetAt > now && a.count >= MAX_ATTEMPTS) {
    return NextResponse.json(
      { ok: false, error: "Demasiados intentos, espera unos minutos" },
      { status: 429 },
    );
  }

  const body = (await req.json().catch(() => null)) as { password?: unknown } | null;
  const password = typeof body?.password === "string" ? body.password : "";

  if (!checkPassword(password)) {
    if (a && a.resetAt > now) a.count += 1;
    else attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return NextResponse.json(
      { ok: false, error: "Contraseña incorrecta" },
      { status: 401 },
    );
  }

  attempts.delete(ip);
  const res = NextResponse.json({ ok: true });
  const https =
    req.headers.get("x-forwarded-proto") === "https" ||
    req.nextUrl.protocol === "https:";
  res.cookies.set(SESSION_COOKIE, createSessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: https,
    path: "/",
    maxAge: SESSION_TTL_S,
  });
  return res;
}

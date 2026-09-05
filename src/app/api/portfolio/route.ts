import { NextRequest, NextResponse } from "next/server";
import { getProjects, saveProjects } from "@/lib/db";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import type { StoredProject } from "@/lib/portfolio";

export const dynamic = "force-dynamic";

const MAX_PROJECTS = 30;
const MAX_TEXT = 800;
const MAX_IMG = 2_000_000; // ~2 MB por imagen (data URL ya redimensionada en el admin)

function str(v: unknown, max: number): string {
  return typeof v === "string" ? v.slice(0, max) : "";
}

function sanitize(input: unknown): StoredProject[] | null {
  if (!Array.isArray(input) || input.length > MAX_PROJECTS) return null;
  const out: StoredProject[] = [];
  for (const item of input) {
    if (typeof item !== "object" || item === null) return null;
    const p = item as Record<string, unknown>;
    const img = str(p.img, MAX_IMG);
    if (img && !img.startsWith("data:image/") && !img.startsWith("/assets/portfolio/")) return null;
    out.push({
      tag: str(p.tag, MAX_TEXT),
      tagEn: str(p.tagEn, MAX_TEXT),
      title: str(p.title, MAX_TEXT),
      titleEn: str(p.titleEn, MAX_TEXT),
      desc: str(p.desc, MAX_TEXT),
      descEn: str(p.descEn, MAX_TEXT),
      img,
    });
  }
  return out;
}

export async function GET() {
  return NextResponse.json({ projects: getProjects() });
}

export async function PUT(req: NextRequest) {
  if (!verifySessionToken(req.cookies.get(SESSION_COOKIE)?.value)) {
    return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
  }
  const body = (await req.json().catch(() => null)) as { projects?: unknown } | null;
  const list = sanitize(body?.projects);
  if (!list) {
    return NextResponse.json({ ok: false, error: "Datos inválidos" }, { status: 400 });
  }
  saveProjects(list);
  return NextResponse.json({ ok: true });
}

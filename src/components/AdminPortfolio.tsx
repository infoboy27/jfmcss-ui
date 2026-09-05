"use client";

import { useEffect, useRef, useState } from "react";
import type { StoredProject } from "@/lib/portfolio";

function defaults(): StoredProject[] {
  return [
    { tag: "App móvil", tagEn: "Mobile app", title: "Proyecto destacado 1", titleEn: "Featured project 1", desc: "Descripción corta del proyecto.", descEn: "Short project description.", img: "" },
    { tag: "Plataforma web", tagEn: "Web platform", title: "Proyecto destacado 2", titleEn: "Featured project 2", desc: "Descripción corta del proyecto.", descEn: "Short project description.", img: "" },
    { tag: "Automatización", tagEn: "Automation", title: "Proyecto destacado 3", titleEn: "Featured project 3", desc: "Descripción corta del proyecto.", descEn: "Short project description.", img: "" },
  ];
}

function resizeImage(file: File, cb: (dataUrl: string) => void) {
  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      const MAX = 1000;
      const k = Math.min(1, MAX / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * k);
      c.height = Math.round(img.height * k);
      c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
      cb(c.toDataURL("image/jpeg", 0.82));
    };
    img.src = reader.result as string;
  };
  reader.readAsDataURL(file);
}

type SaveState = "idle" | "saving" | "saved" | "error";

export default function AdminPortfolio() {
  const [projects, setProjects] = useState<StoredProject[] | null>(null);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetch("/api/portfolio")
      .then((r) => r.json())
      .then((d: { projects?: StoredProject[] }) => {
        setProjects(
          Array.isArray(d.projects) && d.projects.length ? d.projects : defaults(),
        );
      })
      .catch(() => setProjects(defaults()));
  }, []);

  const save = (list: StoredProject[]) => {
    setProjects(list);
    setSaveState("saving");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      try {
        const r = await fetch("/api/portfolio", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ projects: list }),
        });
        if (r.status === 401) {
          alert("Tu sesión expiró. Vuelve a iniciar sesión.");
          location.reload();
          return;
        }
        if (!r.ok) throw new Error();
        setSaveState("saved");
        setSavedAt(new Date().toLocaleTimeString());
      } catch {
        setSaveState("error");
      }
    }, 700);
  };

  const mut = (fn: (list: StoredProject[]) => void) => {
    const list = (projects ?? []).map((p) => ({ ...p }));
    fn(list);
    save(list);
  };

  const logout = async () => {
    await fetch("/api/logout", { method: "POST" }).catch(() => {});
    location.reload();
  };

  const list = projects ?? [];

  const status =
    saveState === "saving"
      ? "guardando…"
      : saveState === "error"
        ? "⚠ no se pudo guardar — revisa la conexión e intenta de nuevo"
        : saveState === "saved" && savedAt
          ? `✓ guardado ${savedAt} — visible para todos los visitantes`
          : "los cambios se guardan automáticamente en el servidor";

  return (
    <div className="admin-page">
      <nav className="admin-nav">
        <div className="admin-brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/logo-light.png" alt="JFMCSS" />
          <span className="admin-brand-name">JFMCSS</span>
          <span className="admin-badge">admin · portafolio</span>
        </div>
        <div className="admin-nav-actions">
          <a href="/" className="admin-back">← ver landing</a>
          <button type="button" className="admin-logout" onClick={logout}>
            cerrar sesión
          </button>
        </div>
      </nav>

      <div className="admin-wrap">
        <div>
          <h1 className="admin-title">Proyectos del portafolio</h1>
          <p className="admin-intro">
            Agrega, edita, reordena o elimina proyectos. Los cambios se guardan
            automáticamente en el servidor y aparecen en la sección Portafolio
            del landing para todos los visitantes. Los campos &quot;EN&quot; son
            opcionales: se usan cuando el visitante cambia el idioma a inglés.
          </p>
        </div>

        {projects === null ? (
          <p className="admin-intro">cargando…</p>
        ) : null}

        {list.map((p, i) => (
          <div className="admin-card" key={i}>
            <div className="admin-card-media">
              <div className="admin-thumb">
                {p.img ? (
                  <div
                    className="admin-thumb-img"
                    style={{ backgroundImage: `url("${p.img}")` }}
                  />
                ) : (
                  <span className="admin-thumb-empty">sin imagen</span>
                )}
              </div>
              <label className="admin-upload">
                subir imagen
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const f = e.target.files && e.target.files[0];
                    if (f) resizeImage(f, (url) => mut((l) => { l[i].img = url; }));
                  }}
                />
              </label>
              {p.img ? (
                <button
                  type="button"
                  className="admin-clear-img"
                  onClick={() => mut((l) => { l[i].img = ""; })}
                >
                  quitar imagen
                </button>
              ) : null}
            </div>
            <div className="admin-card-fields">
              <div className="admin-card-head">
                <span className="admin-num">#{i + 1}</span>
                <div className="admin-actions">
                  <button
                    type="button"
                    title="Subir"
                    className="admin-btn-move"
                    onClick={() => {
                      if (i > 0) mut((l) => { const [x] = l.splice(i, 1); l.splice(i - 1, 0, x); });
                    }}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    title="Bajar"
                    className="admin-btn-move"
                    onClick={() => {
                      if (i < list.length - 1) mut((l) => { const [x] = l.splice(i, 1); l.splice(i + 1, 0, x); });
                    }}
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    title="Eliminar"
                    className="admin-btn-delete"
                    onClick={() => {
                      if (confirm("¿Eliminar este proyecto?")) mut((l) => { l.splice(i, 1); });
                    }}
                  >
                    ✕
                  </button>
                </div>
              </div>
              <div className="admin-row-2">
                <input
                  value={p.tag ?? ""}
                  onChange={(e) => mut((l) => { l[i].tag = e.target.value; })}
                  placeholder="Categoría (ej: App móvil)"
                />
                <input
                  value={p.tagEn ?? ""}
                  onChange={(e) => mut((l) => { l[i].tagEn = e.target.value; })}
                  placeholder="Categoría EN (opcional)"
                />
              </div>
              <div className="admin-row-2">
                <input
                  value={p.title ?? ""}
                  onChange={(e) => mut((l) => { l[i].title = e.target.value; })}
                  placeholder="Título del proyecto"
                />
                <input
                  value={p.titleEn ?? ""}
                  onChange={(e) => mut((l) => { l[i].titleEn = e.target.value; })}
                  placeholder="Título EN (opcional)"
                />
              </div>
              <textarea
                value={p.desc ?? ""}
                onChange={(e) => mut((l) => { l[i].desc = e.target.value; })}
                rows={2}
                placeholder="Descripción corta"
              />
              <textarea
                value={p.descEn ?? ""}
                onChange={(e) => mut((l) => { l[i].descEn = e.target.value; })}
                rows={2}
                placeholder="Descripción EN (opcional)"
              />
            </div>
          </div>
        ))}

        <button
          type="button"
          className="admin-add"
          onClick={() => mut((l) => { l.push({ tag: "", tagEn: "", title: "", titleEn: "", desc: "", descEn: "", img: "" }); })}
        >
          + agregar proyecto
        </button>

        <div className="admin-footer">
          <span className="admin-status">{status}</span>
          <button
            type="button"
            className="admin-reset"
            onClick={() => {
              if (confirm("¿Restaurar los proyectos de ejemplo? Se perderán los cambios.")) save(defaults());
            }}
          >
            restaurar ejemplos
          </button>
        </div>
      </div>
    </div>
  );
}

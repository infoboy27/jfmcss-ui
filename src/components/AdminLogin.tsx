"use client";

import { useState } from "react";

export default function AdminLogin({ configured }: { configured: boolean }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const r = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (r.ok) {
        location.reload();
        return;
      }
      const data = (await r.json().catch(() => null)) as { error?: string } | null;
      setError(data?.error || "No se pudo iniciar sesión");
    } catch {
      setError("Error de conexión");
    }
    setBusy(false);
  };

  return (
    <div className="admin-page">
      <nav className="admin-nav">
        <div className="admin-brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/logo-light.png" alt="JFMCSS" />
          <span className="admin-brand-name">JFMCSS</span>
          <span className="admin-badge">admin · portafolio</span>
        </div>
        <a href="/" className="admin-back">← ver landing</a>
      </nav>

      <div className="admin-login-wrap">
        <form className="admin-login-card" onSubmit={submit}>
          <h1 className="admin-title">Acceso admin</h1>
          <p className="admin-intro">
            Introduce la contraseña de administrador para editar el portafolio.
          </p>
          {configured ? null : (
            <p className="admin-login-error">
              El servidor no tiene <code>ADMIN_PASSWORD</code> configurado.
            </p>
          )}
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña"
            autoFocus
            required
          />
          {error ? <p className="admin-login-error">{error}</p> : null}
          <button type="submit" disabled={busy || !configured}>
            {busy ? "Verificando…" : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}

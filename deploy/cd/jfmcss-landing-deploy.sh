#!/usr/bin/env bash
# Despliegue continuo de la landing jfmcss.com (2026-10-15).
#
# Vive en el servidor en ~/jfmcss-landing-deploy/jfmcss-landing-deploy.sh y es
# lo UNICO que puede ejecutar la llave de GitHub Actions: authorized_keys la
# fija con command="..." y sin pty/forwarding, asi una llave filtrada no abre
# un shell. Mismo patron que ~/dondeta-deploy y ~/portal-deploy. La accion
# llega en SSH_ORIGINAL_COMMAND:
#
#   deploy <sha>   ~/jfmcss-landingv2 -> <sha> (debe estar en origin/main),
#                  rebuild, health check; si falla vuelve al commit anterior.
#   status         commit desplegado.
#   rollback       vuelve al commit anterior al ultimo deploy.
#
# Solo cambia codigo. .env y el volumen landing-data (SQLite del portafolio)
# no los toca git.
set -euo pipefail

HERE="$(cd "$(dirname "$0")" && pwd)"
DIR="$HOME/jfmcss-landingv2"
PORT=3016
LOG="$HERE/deploy.log"
STATE="$HERE/state"
mkdir -p "$STATE"

log() { echo "$(date -u '+%Y-%m-%dT%H:%M:%SZ') $*" | tee -a "$LOG" >&2; }
fail() { log "ERROR: $*"; exit 1; }

healthy() {
  local i
  for i in $(seq 1 40); do
    curl -fsS -m 10 -o /dev/null "http://127.0.0.1:$PORT/" && return 0
    sleep 3
  done
  return 1
}

build_and_up() {
  (cd "$DIR" && docker compose build --quiet && docker compose up -d) >>"$LOG" 2>&1
}

status() {
  printf '{"jfmcss-landingv2":{"sha":"%s","deployed_at":"%s"}}\n' \
    "$(git -C "$DIR" rev-parse --short HEAD 2>/dev/null)" \
    "$(cat "$STATE/deployed_at" 2>/dev/null)"
}

deploy() {
  local sha="$1" prev
  cd "$DIR"
  prev="$(git rev-parse HEAD)"
  git fetch -q origin main
  git merge-base --is-ancestor "$sha" origin/main || fail "$sha no esta en origin/main"
  if [ "$prev" = "$(git rev-parse "$sha")" ] && [ -z "$(git status --porcelain --untracked-files=no)" ] && healthy; then
    log "ya en ${sha:0:7}, sano"
    return 0
  fi
  echo "$prev" >"$STATE/previous"
  log "${prev:0:7} -> ${sha:0:7}"
  git reset -q --hard "$sha"
  if build_and_up && healthy; then
    date -u '+%Y-%m-%dT%H:%M:%SZ' >"$STATE/deployed_at"
    log "sano en ${sha:0:7}"
    return 0
  fi
  log "health check FALLO en ${sha:0:7}, volviendo a ${prev:0:7}"
  git reset -q --hard "$prev"
  build_and_up || true
  if healthy; then log "rollback ok, sano"; else log "SIGUE CAIDO despues del rollback"; fi
  return 1
}

read -r ACTION ARG1 _ <<<"${SSH_ORIGINAL_COMMAND:-${*:-status}}"

exec 9>"$HERE/.lock"
flock -w 900 9 || fail "hay otro deploy corriendo"

case "$ACTION" in
  deploy)
    [[ "${ARG1:-}" =~ ^[0-9a-f]{7,40}$ ]] || fail "uso: deploy <sha>"
    rc=0
    deploy "$ARG1" || rc=1
    status
    exit $rc
    ;;
  status)
    status
    ;;
  rollback)
    prev="$(cat "$STATE/previous" 2>/dev/null)" || fail "no hay commit anterior registrado"
    cd "$DIR" && git reset -q --hard "$prev"
    build_and_up
    healthy || fail "caido despues del rollback"
    log "rollback a ${prev:0:7}"
    status
    ;;
  *)
    fail "accion desconocida: $ACTION"
    ;;
esac

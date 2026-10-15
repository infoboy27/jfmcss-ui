# Despliegue continuo

Cada push a `main` → GitHub Actions (`.github/workflows/deploy.yml`) compila → por SSH ejecuta `deploy <sha>` en 163.245.207.38.

- Servidor: `~/jfmcss-landing-deploy/jfmcss-landing-deploy.sh` (copia de `deploy/cd/jfmcss-landing-deploy.sh`; si cambias el script, vuelve a copiarlo a mano).
- La llave del secreto `DEPLOY_SSH_KEY` está en `~/.ssh/authorized_keys` con `command="..."`: solo puede correr ese script.
- Repo en el servidor: `~/jfmcss-landingv2` (contenedor `jfmcss-landingv2`, puerto 3016). `.env` y el volumen `landing-data` no los toca git.
- Log: `~/jfmcss-landing-deploy/deploy.log`.
- Manual: Actions → Deploy → Run workflow → `status` o `rollback`.

Ya no se sube nada con `scp`: todo pasa por git.

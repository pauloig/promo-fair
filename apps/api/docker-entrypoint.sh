#!/bin/sh
set -eu

echo "[api] Esperando base de datos y aplicando migraciones..."

intentos=0
hasta=30
until ./node_modules/.bin/prisma migrate deploy --schema prisma/schema.prisma; do
  intentos=$((intentos + 1))
  if [ "$intentos" -ge "$hasta" ]; then
    echo "[api] No se pudieron aplicar las migraciones tras $hasta intentos" >&2
    exit 1
  fi
  echo "[api] Base de datos no lista, reintento $intentos/$hasta..."
  sleep 2
done

echo "[api] Sembrando catálogo (solo si está vacío) y usuario de Ventas..."
node dist-seed/prisma/seed.js

echo "[api] Iniciando API..."
exec node dist/main.js
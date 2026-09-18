#!/bin/sh
set -e

DOMAIN="disagro.endtoendsolutions.dev"
CERT_DIR="/etc/letsencrypt/live/$DOMAIN"

# Bootstrap: si aún no hay certificado (primera ejecución), genera uno temporal
# para que nginx pueda arrancar y así certbot pueda emitir el real vía webroot.
if [ ! -f "$CERT_DIR/fullchain.pem" ] || [ ! -f "$CERT_DIR/privkey.pem" ]; then
  echo "Certificado TLS no encontrado; generando uno temporal para el arranque..."

  if ! command -v openssl >/dev/null 2>&1; then
    apk add --no-cache openssl >/dev/null 2>&1 || true
  fi

  mkdir -p "$CERT_DIR"
  openssl req -x509 -nodes -newkey rsa:2048 -days 1 \
    -keyout "$CERT_DIR/privkey.pem" \
    -out "$CERT_DIR/fullchain.pem" \
    -subj "/CN=$DOMAIN" >/dev/null 2>&1

  echo "Certificado temporal listo."
fi

# Recarga periódica para aplicar renovaciones emitidas por certbot.
(
  while :; do
    sleep 6h
    nginx -s reload 2>/dev/null || true
  done
) &

exec nginx -g "daemon off;"
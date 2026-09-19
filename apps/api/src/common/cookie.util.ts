import type { Request } from "express";

export function leerCookieDe(request: Request, nombre: string): string | undefined {
  const cabecera = request.headers.cookie;
  if (cabecera === undefined) return undefined;

  for (const segmento of cabecera.split(";")) {
    const igual = segmento.indexOf("=");
    if (igual === -1) continue;

    const nombreSegmento = segmento.slice(0, igual).trim();
    const valor = segmento.slice(igual + 1);
    if (nombreSegmento !== nombre) continue;

    try {
      return decodeURIComponent(valor.trim());
    } catch {
      return undefined;
    }
  }

  return undefined;
}
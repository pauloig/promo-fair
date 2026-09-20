const NOMBRE_COOKIE = "disagro_csrf";
const CABECERA = "X-CSRF-Token";
const BASE_API = import.meta.env.VITE_API_URL ?? "/api";

function leerCookie(nombre: string): string | undefined {
  for (const parte of document.cookie.split(";")) {
    const indice = parte.indexOf("=");
    if (indice === -1) continue;
    if (parte.slice(0, indice).trim() !== nombre) continue;
    try {
      return decodeURIComponent(parte.slice(indice + 1).trim());
    } catch {
      return undefined;
    }
  }
  return undefined;
}

export async function obtenerCabeceraCsrf(): Promise<Record<string, string>> {
  let token = leerCookie(NOMBRE_COOKIE);

  if (token === undefined) {
    await fetch(`${BASE_API}/csrf-token`, {
      method: "GET",
      credentials: "include",
    });
    token = leerCookie(NOMBRE_COOKIE);
  }

  if (token === undefined) {
    throw new Error("No se pudo obtener el token CSRF de la cookie");
  }

  return { [CABECERA]: token };
}
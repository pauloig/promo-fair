export function formatoFechaLegible(iso: string): string {
  if (!iso) return "";
  const formateador = new Intl.DateTimeFormat("es-GT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return formateador.format(new Date(iso));
}

export function formatoFechaCorta(iso: string): string {
  if (!iso) return "";
  const formateador = new Intl.DateTimeFormat("es-GT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  return formateador.format(new Date(iso));
}

function rellenar(n: number): string {
  return String(n).padStart(2, "0");
}

export function isoADatetimeLocal(iso: string): string {
  if (!iso) return "";
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return "";
  return `${fecha.getFullYear()}-${rellenar(fecha.getMonth() + 1)}-${rellenar(
    fecha.getDate(),
  )}T${rellenar(fecha.getHours())}:${rellenar(fecha.getMinutes())}`;
}

export function datetimeLocalAIso(nativa: string): string {
  if (!nativa) return "";
  const fecha = new Date(nativa);
  if (Number.isNaN(fecha.getTime())) return "";
  return fecha.toISOString();
}

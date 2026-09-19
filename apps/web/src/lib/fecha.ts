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
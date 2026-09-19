import type { TipoItem } from "../lib/catalogo";

const CLASES_BADGE_OSCURO: Record<TipoItem, string> = {
  SERVICIO: "border-sky-300/40 bg-sky-400/10 text-sky-300",
  PRODUCTO: "border-amber-300/40 bg-amber-300/10 text-amber-300",
};

const CLASES_BADGE_CLARO: Record<TipoItem, string> = {
  SERVICIO: "border-sky-200 bg-sky-100 text-sky-800",
  PRODUCTO: "border-amber-200 bg-amber-100 text-amber-800",
};

export function EtiquetaTipo({
  tipo,
  variante = "oscuro",
}: {
  tipo: TipoItem;
  variante?: "oscuro" | "claro";
}) {
  return (
    <span
      className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
        variante === "oscuro" ? CLASES_BADGE_OSCURO[tipo] : CLASES_BADGE_CLARO[tipo]
      }`}
    >
      {tipo === "SERVICIO" ? "Servicio" : "Producto"}
    </span>
  );
}
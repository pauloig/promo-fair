import { useMemo, useState } from "react";
import { CATALOGO } from "../lib/catalogo";
import type { TipoItem } from "../lib/catalogo";
import { formatearPrecioQ } from "../lib/dinero";
import type { ResumenDescuentos } from "../lib/descuentos";
import { EncabezadoSeccion } from "./EncabezadoSeccion";
import { IconoCheck, IconoLupa } from "./Iconos";

type Props = {
  seleccionados: ReadonlySet<string>;
  onAlternar: (id: string) => void;
  resumen: ResumenDescuentos;
};

const CLASES_BADGE: Record<TipoItem, string> = {
  SERVICIO: "border-sky-300/40 bg-sky-400/10 text-sky-300",
  PRODUCTO: "border-amber-300/40 bg-amber-300/10 text-amber-300",
};

export function PanelCatalogo({ seleccionados, onAlternar, resumen }: Props) {
  const [busqueda, setBusqueda] = useState("");

  const filtrados = useMemo(
    () =>
      CATALOGO.filter((item) =>
        item.nombre.toLowerCase().includes(busqueda.trim().toLowerCase()),
      ),
    [busqueda],
  );

  return (
    <section className="flex flex-col gap-3">
      <EncabezadoSeccion numero={2} titulo="Seleccione Servicios y Productos de su interés" />

      <div className="flex max-h-[480px] flex-col gap-4 rounded-xl bg-carbon p-4">
        <div className="relative">
          <input
            type="search"
            value={busqueda}
            onChange={(evento) => setBusqueda(evento.target.value)}
            placeholder="Buscar Servicios y Productos"
            aria-label="Buscar Servicios y Productos"
            className="h-11 w-full rounded-full border-none bg-white pl-4 pr-12 text-sm text-[#2d3436] placeholder:text-[#9aa0a6] focus:outline-none focus:ring-2 focus:ring-verde/50"
          />
          <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-[#6b7280]">
            <IconoLupa />
          </span>
        </div>

        <p className="text-center text-sm font-bold text-white">
          Servicios y/o Productos seleccionados:
        </p>

        <ul className="lista-oscura flex max-h-60 flex-col gap-2 overflow-y-auto pr-1">
          {filtrados.length === 0 ? (
            <li className="rounded-lg bg-white/5 px-3 py-3 text-center text-sm text-white/60">
              No se encontró ningún elemento para “{busqueda}”.
            </li>
          ) : (
            filtrados.map((item) => {
              const seleccionado = seleccionados.has(item.id);
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => onAlternar(item.id)}
                    aria-pressed={seleccionado}
                    className="flex w-full items-center gap-3 rounded-lg bg-white/5 px-3 py-2.5 text-left hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-verde/50"
                  >
                    <span
                      className={
                        seleccionado
                          ? "flex h-5 w-5 shrink-0 items-center justify-center rounded bg-verde text-white"
                          : "flex h-5 w-5 shrink-0 items-center justify-center rounded border border-white/40 text-transparent"
                      }
                    >
                      <IconoCheck />
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm text-white">
                      {item.nombre}
                    </span>
                    <span
                      className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${CLASES_BADGE[item.tipo]}`}
                    >
                      {item.tipo === "SERVICIO" ? "Servicio" : "Producto"}
                    </span>
                    <span className="shrink-0 text-sm font-semibold text-white">
                      {formatearPrecioQ(item.precioCentavos)}
                    </span>
                  </button>
                </li>
              );
            })
          )}
        </ul>

        <div className="grid grid-cols-2 divide-x divide-white/15 border-t border-white/15 pt-3">
          <div className="flex flex-col items-center gap-1">
            <span className="text-center text-xs leading-snug text-white/70">
              Descuento obtenido en Servicios
            </span>
            <span className="text-xl font-bold leading-none text-verde-claro">
              −{resumen.servicios.porcentaje}%
            </span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-center text-xs leading-snug text-white/70">
              Descuento obtenido en Productos
            </span>
            <span className="text-xl font-bold leading-none text-verde-claro">
              −{resumen.productos.porcentaje}%
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
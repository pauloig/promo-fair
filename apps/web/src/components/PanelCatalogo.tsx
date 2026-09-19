import { useId, useMemo, useState } from "react";
import { CATALOGO, ETIQUETA_TIPO } from "../lib/catalogo";
import { formatearQuetzales } from "../lib/dinero";
import type { TipoItem } from "../lib/catalogo";

type Props = {
  seleccionados: ReadonlySet<string>;
  onAlternar: (id: string) => void;
};

type Grupo = {
  tipo: TipoItem;
  titulo: string;
  nota: string;
};

const GRUPOS: Grupo[] = [
  { tipo: "SERVICIO", titulo: "Servicios", nota: "2 o más: 3% · superior a Q 1,500: 5%" },
  { tipo: "PRODUCTO", titulo: "Productos", nota: "3 o más: 3% · 5 o más: 5%" },
];

export function PanelCatalogo({ seleccionados, onAlternar }: Props) {
  const [busqueda, setBusqueda] = useState("");
  const tituloId = useId();

  const gruposFiltrados = useMemo(
    () =>
      GRUPOS.map((grupo) => ({
        ...grupo,
        items: CATALOGO.filter(
          (item) =>
            item.tipo === grupo.tipo &&
            item.nombre.toLowerCase().includes(busqueda.trim().toLowerCase()),
        ),
      })),
    [busqueda],
  );

  const hayResultados = gruposFiltrados.some((grupo) => grupo.items.length > 0);

  return (
    <section
      aria-labelledby={tituloId}
      className="flex flex-col gap-5 rounded-xl border border-linea bg-white p-5 shadow-sm"
    >
      <div className="flex items-baseline justify-between gap-3">
        <h2 id={tituloId} className="text-lg font-bold tracking-tight text-tinta">
          Elija su selección
        </h2>
        {seleccionados.size > 0 && (
          <p className="text-sm font-semibold text-agro-700">
            {seleccionados.size} seleccionado{seleccionados.size === 1 ? "" : "s"}
          </p>
        )}
      </div>

      <div className="relative">
        <input
          type="search"
          value={busqueda}
          onChange={(evento) => setBusqueda(evento.target.value)}
          placeholder="Buscar servicio o producto…"
          aria-label="Buscar en el catálogo"
          className="w-full rounded-md border border-linea bg-papel/60 px-3 py-2 pr-16 text-sm text-tinta placeholder:text-ceniza focus:border-agro-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-agro-600/30"
        />
        {busqueda && (
          <button
            type="button"
            onClick={() => setBusqueda("")}
            aria-label="Limpiar búsqueda"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-xs font-semibold text-agro-700 hover:bg-agro-100 focus:outline-none focus:ring-2 focus:ring-agro-600/40"
          >
            Limpiar
          </button>
        )}
      </div>

      {!hayResultados ? (
        <p className="rounded-md border border-dashed border-linea px-3 py-6 text-sm text-ceniza">
          No se encontró ningún elemento para “{busqueda}”.
        </p>
      ) : (
        gruposFiltrados.map((grupo) => {
          if (grupo.items.length === 0) return null;
          return (
            <div key={grupo.tipo} className="flex flex-col gap-2">
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="text-sm font-bold uppercase tracking-wide text-agro-800">
                  {grupo.titulo}
                </h3>
                <p className="text-xs text-ceniza">{grupo.nota}</p>
              </div>
              <ul className="flex flex-col gap-2">
                {grupo.items.map((item) => {
                  const seleccionado = seleccionados.has(item.id);
                  return (
                    <li key={item.id}>
                      <label
                        className={
                          seleccionado
                            ? "flex cursor-pointer items-center gap-3 rounded-lg border border-agro-600 bg-agro-100 px-3 py-2.5"
                            : "flex cursor-pointer items-center gap-3 rounded-lg border border-linea bg-white px-3 py-2.5 hover:border-agro-600/60"
                        }
                      >
                        <input
                          type="checkbox"
                          checked={seleccionado}
                          onChange={() => onAlternar(item.id)}
                          className="h-4 w-4 shrink-0 accent-hoja-700 focus:outline-none focus:ring-2 focus:ring-agro-600/40"
                        />
                        <span className="flex-1">
                          <span className="block text-sm font-medium leading-snug text-tinta">
                            {item.nombre}
                          </span>
                          <span className="block text-xs text-ceniza">
                            {ETIQUETA_TIPO[item.tipo]}
                          </span>
                        </span>
                        <span className="shrink-0 text-sm font-bold text-tinta">
                          {formatearQuetzales(item.precioCentavos)}
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })
      )}
    </section>
  );
}
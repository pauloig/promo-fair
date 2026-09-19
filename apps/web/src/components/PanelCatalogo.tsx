import type { CatalogoItem } from "../lib/catalogo";
import { formatearPrecioQ } from "../lib/dinero";
import type { ResumenDescuentos } from "../lib/descuentos";
import { EncabezadoSeccion } from "./EncabezadoSeccion";
import { EtiquetaTipo } from "./EtiquetaTipo";
import { IconoCheck, IconoLupa } from "./Iconos";

type Props = {
  filtrados: CatalogoItem[];
  busqueda: string;
  onCambioBusqueda: (valor: string) => void;
  seleccionados: ReadonlySet<string>;
  onAlternar: (id: string) => void;
  resumen: ResumenDescuentos;
  cargando: boolean;
  error: string | null;
  sinResultados: boolean;
  onReintentar: () => void;
};

export function PanelCatalogo({
  filtrados,
  busqueda,
  onCambioBusqueda,
  seleccionados,
  onAlternar,
  resumen,
  cargando,
  error,
  sinResultados,
  onReintentar,
}: Props) {
  return (
    <section className="flex flex-col gap-3">
      <EncabezadoSeccion
        numero={2}
        titulo="Seleccione Servicios y Productos de su interés"
      />

      <div className="flex max-h-[480px] flex-col gap-4 rounded-xl bg-carbon p-5">
        <div className="relative">
          <input
            type="search"
            value={busqueda}
            onChange={(evento) => onCambioBusqueda(evento.target.value)}
            placeholder="Buscar Servicios y Productos"
            aria-label="Buscar Servicios y Productos"
            className="h-11 w-full rounded-full border-none bg-white pl-4 pr-12 text-sm text-[#2d3436] placeholder:text-[#6b7280] transition-colors hover:ring-1 hover:ring-verde/40 focus:outline-none focus:ring-2 focus:ring-verde/50"
          />
          <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-[#6b7280]">
            <IconoLupa />
          </span>
        </div>

        <p className="text-center text-sm font-bold text-white">
          Servicios y/o Productos seleccionados:
        </p>

        {cargando ? (
          <ul className="lista-oscura flex max-h-60 flex-col gap-2 overflow-y-auto pr-1">
            <li className="rounded-lg bg-white/5 px-3 py-3 text-center text-sm text-white/60">
              Consultando el catálogo…
            </li>
          </ul>
        ) : error !== null ? (
          <ul className="lista-oscura flex max-h-60 flex-col gap-2 overflow-y-auto pr-1">
            <li className="flex flex-col gap-2 rounded-lg bg-hoja/10 px-3 py-3 text-center text-sm text-white/80">
              <span>No se pudo cargar el catálogo. {error}</span>
              <button
                type="button"
                onClick={onReintentar}
                className="mx-auto rounded-full bg-hoja px-4 py-1.5 text-xs font-bold text-carbon transition-colors hover:bg-hoja-oscuro focus:outline-none focus:ring-2 focus:ring-hoja"
              >
                Reintentar
              </button>
            </li>
          </ul>
        ) : sinResultados ? (
          <ul className="lista-oscura flex max-h-60 flex-col gap-2 overflow-y-auto pr-1">
            <li className="rounded-lg bg-white/5 px-3 py-3 text-center text-sm text-white/60">
              {busqueda.trim() === ""
                ? "El catálogo está vacío."
                : `No se encontró ningún elemento para “${busqueda}”.`}
            </li>
          </ul>
        ) : (
          <GruposCatalogo
            items={filtrados}
            seleccionados={seleccionados}
            onAlternar={onAlternar}
          />
        )}

        <div
          className="grid grid-cols-2 divide-x divide-white/15 border-t border-white/15 pt-3"
          aria-live="polite"
          aria-atomic="true"
        >
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

        <p
          role="note"
          className="text-center text-[11px] leading-snug text-white/50"
        >
          Descuento en vivo a modo de vista previa: se confirma al enviar el
          formulario.
        </p>
      </div>
    </section>
  );
}

type PropsGrupo = {
  titulo: string;
  items: CatalogoItem[];
  seleccionados: ReadonlySet<string>;
  onAlternar: (id: string) => void;
};

function GruposCatalogo({
  items,
  seleccionados,
  onAlternar,
}: Omit<PropsGrupo, "titulo">) {
  const servicios = items.filter((item) => item.tipo === "SERVICIO");
  const productos = items.filter((item) => item.tipo === "PRODUCTO");

  return (
    <div className="flex max-h-60 flex-col gap-2 overflow-y-auto pr-1">
      {servicios.length > 0 && (
        <GrupoCatalogo
          titulo="Servicios"
          items={servicios}
          seleccionados={seleccionados}
          onAlternar={onAlternar}
        />
      )}
      {productos.length > 0 && (
        <GrupoCatalogo
          titulo="Productos"
          items={productos}
          seleccionados={seleccionados}
          onAlternar={onAlternar}
        />
      )}
    </div>
  );
}

function GrupoCatalogo({
  titulo,
  items,
  seleccionados,
  onAlternar,
}: PropsGrupo) {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-xs font-black uppercase tracking-wide text-verde-claro">
        {titulo}
      </p>
      <ul className="lista-oscura flex flex-col gap-2">
        {items.map((item) => (
          <ItemCatalogo
            key={item.id}
            item={item}
            seleccionado={seleccionados.has(item.id)}
            onAlternar={onAlternar}
          />
        ))}
      </ul>
    </div>
  );
}

type PropsItem = {
  item: CatalogoItem;
  seleccionado: boolean;
  onAlternar: (id: string) => void;
};

function ItemCatalogo({ item, seleccionado, onAlternar }: PropsItem) {
  return (
    <li>
      <button
        type="button"
        onClick={() => onAlternar(item.id)}
        aria-pressed={seleccionado}
        className="grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-lg bg-white/5 px-3 py-2 text-left transition-colors hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-verde/50"
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
        <span className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-sm leading-snug text-white">{item.nombre}</span>
          <EtiquetaTipo tipo={item.tipo} />
        </span>
        <span className="shrink-0 whitespace-nowrap text-sm font-semibold text-white">
          {formatearPrecioQ(item.precioCentavos)}
        </span>
      </button>
    </li>
  );
}

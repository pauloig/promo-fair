import {
  ConfirmacionItemResumen,
  ConfirmacionResumen,
  TipoItem,
} from "@disagro/shared/schemas";
import { formatearPrecioQ } from "../lib/dinero";
import { Encabezado } from "./Encabezado";
import { Introduccion } from "./Introduccion";
import { EtiquetaTipo } from "./EtiquetaTipo";
import { IconoCheck } from "./Iconos";
import { Pie } from "./Pie";
import { StepperProgreso } from "./StepperProgreso";
import type { PasoProgreso } from "./StepperProgreso";

const PASOS_CONFIRMADOS: PasoProgreso[] = [
  { numero: 1, etiqueta: "Datos", estado: "completado" },
  { numero: 2, etiqueta: "Selección", estado: "completado" },
  { numero: 3, etiqueta: "Confirmar", estado: "completado" },
];

const TITULO_POR_TIPO: Record<TipoItem, string> = {
  SERVICIO: "Servicios",
  PRODUCTO: "Productos",
};

type Props = {
  resumen: ConfirmacionResumen;
  nombre: string;
  onEditar?: () => void;
};

export function PantallaConfirmada({ resumen, nombre, onEditar }: Props) {
  const itemsServicios = resumen.items.filter(
    (item) => item.tipo === "SERVICIO",
  );
  const itemsProductos = resumen.items.filter(
    (item) => item.tipo === "PRODUCTO",
  );

  const subtotalServicios = sumarPrecios(itemsServicios);
  const subtotalProductos = sumarPrecios(itemsProductos);
  const ahorroServicios = Math.round(
    (subtotalServicios * resumen.descuentoServiciosPct) / 100,
  );
  const ahorroProductos = Math.round(
    (subtotalProductos * resumen.descuentoProductosPct) / 100,
  );
  const ahorroTotal = ahorroServicios + ahorroProductos;
  const totalAntes = subtotalServicios + subtotalProductos;
  const totalDespues = totalAntes - ahorroTotal;

  const saludo = nombre.trim() !== "" ? `, ${nombre.trim()}` : "";

  return (
    <div className="min-h-screen bg-gris-pagina">
      <Encabezado sobreTitulo="FERIA DE PROMOCIONES DISAGRO" />

      <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 lg:py-10">
        <Introduccion
          titulo="La feria, a su medida"
          descripcion="Su asistencia quedó registrada junto con su selección de servicios y productos."
        />

        <div className="mt-6 flex flex-col items-center gap-3 rounded-2xl bg-carbon p-8 text-center text-white shadow-lg">
          <StepperProgreso pasos={PASOS_CONFIRMADOS} />
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-hoja text-carbon">
            <IconoCheck className="h-6 w-6" />
          </span>
          <h2 className="text-2xl font-black">¡Asistencia confirmada!</h2>
          <p className="text-sm leading-relaxed text-white/70">
            Gracias{saludo}. El equipo de Ventas preparará su portafolio de
            promociones con la selección que se detalla a continuación.
          </p>
          <p className="text-xs text-white/50">Confirmación nº {resumen.id}</p>
        </div>

        <section className="mt-6 flex flex-col gap-5 rounded-2xl border border-[#e1e5e8] bg-white p-6 shadow-sm">
          <h3 className="text-base font-black text-[#2d3436]">
            Detalle de su confirmación
          </h3>

          <GrupoItems tipo="SERVICIO" items={itemsServicios} />
          <GrupoItems tipo="PRODUCTO" items={itemsProductos} />

          <dl className="flex flex-col gap-2 border-t border-[#e1e5e8] pt-4 text-sm">
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-[#4a555a]">
                Subtotal Servicios{" "}
                <span className="text-[#6b7280]">
                  ({itemsServicios.length})
                </span>
              </dt>
              <dd className="font-bold text-[#2d3436]">
                {formatearPrecioQ(subtotalServicios)}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-[#4a555a]">
                Subtotal Productos{" "}
                <span className="text-[#6b7280]">
                  ({itemsProductos.length})
                </span>
              </dt>
              <dd className="font-bold text-[#2d3436]">
                {formatearPrecioQ(subtotalProductos)}
              </dd>
            </div>
          </dl>

          <div className="flex flex-wrap gap-2">
            {resumen.descuentoServiciosPct > 0 && (
              <span className="rounded-full border border-hoja/50 bg-hoja/15 px-3 py-1 text-xs font-bold text-hoja-oscuro">
                Servicios −{resumen.descuentoServiciosPct}%
              </span>
            )}
            {resumen.descuentoProductosPct > 0 && (
              <span className="rounded-full border border-hoja/50 bg-hoja/15 px-3 py-1 text-xs font-bold text-hoja-oscuro">
                Productos −{resumen.descuentoProductosPct}%
              </span>
            )}
            {resumen.descuentoServiciosPct === 0 &&
              resumen.descuentoProductosPct === 0 && (
                <span className="rounded-full border border-[#e1e5e8] bg-gris-pagina px-3 py-1 text-xs font-bold text-[#6b7280]">
                  Sin descuento aplicable en esta selección
                </span>
              )}
          </div>

          {ahorroTotal > 0 && (
            <p className="text-sm font-bold text-hoja-oscuro">
              Usted ahorró {formatearPrecioQ(ahorroTotal)} con esta selección
            </p>
          )}

          <div className="flex flex-col gap-1 border-t border-[#e1e5e8] pt-4">
            <p className="text-right text-xs text-[#6b7280] line-through">
              {formatearPrecioQ(totalAntes)}
            </p>
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-sm text-[#4a555a]">Total a pagar</span>
              <span className="text-2xl font-black text-verde">
                {formatearPrecioQ(totalDespues)}
              </span>
            </div>
          </div>

          <p
            role="note"
            className="text-center text-[11px] leading-snug text-[#6b7280]"
          >
            Nombre y precio de cada ítem, así como los descuentos, son los que
            el sistema registró en el momento de su confirmación.
          </p>
        </section>

        {onEditar !== undefined && (
          <div className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={onEditar}
              className="rounded-xl border border-hoja/60 bg-white px-5 py-3 text-sm font-black text-hoja-oscuro transition-colors hover:bg-hoja/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-hoja"
            >
              Editar mi confirmación
            </button>
          </div>
        )}
      </main>

      <Pie />
    </div>
  );
}

type PropsGrupo = {
  tipo: TipoItem;
  items: ConfirmacionItemResumen[];
};

function GrupoItems({ tipo, items }: PropsGrupo) {
  if (items.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      <h4 className="text-sm font-black uppercase tracking-wide text-[#4a555a]">
        {TITULO_POR_TIPO[tipo]}
      </h4>
      <ul className="flex flex-col gap-1.5">
        {items.map((item) => (
          <li
            key={item.id}
            className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-lg bg-gris-claro px-3 py-2"
          >
            <span className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
              <span className="text-sm text-[#2d3436]">
                {item.nombreCongelado}
              </span>
              <EtiquetaTipo tipo={item.tipo} variante="claro" />
            </span>
            <span className="shrink-0 whitespace-nowrap text-sm font-bold text-[#2d3436]">
              {formatearPrecioQ(item.precioCongeladoCentavos)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function sumarPrecios(items: ConfirmacionItemResumen[]): number {
  return items.reduce(
    (acumulado, item) => acumulado + item.precioCongeladoCentavos,
    0,
  );
}

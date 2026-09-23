import { useEffect, useMemo, useState } from "react";
import { Controller } from "react-hook-form";
import type {
  VentasConfirmacionFila,
  VentasResumen,
} from "@disagro/shared/schemas";
import { Encabezado } from "../components/Encabezado";
import { EtiquetaTipo } from "../components/EtiquetaTipo";
import { IconoChevron } from "../components/Iconos";
import { Pie } from "../components/Pie";
import { useVentas } from "../hooks/useVentas";
import type { FiltrosFormulario } from "../hooks/useVentas";
import { formatearPrecioQ } from "../lib/dinero";
import { formatoFechaLegible } from "../lib/fecha";

type Ventas = ReturnType<typeof useVentas>;

const ANCHO_PANEL = "max-w-[100rem]";

const ETIQUETA_INTERNA =
  "text-[11px] font-bold uppercase tracking-wider text-[#6b7280]";

const CAMPO_INTERNO =
  "h-9 w-full rounded-md border border-[#d8d8d8] bg-white px-2.5 text-sm text-[#2d3436] tabular-nums transition-colors focus:border-carbon focus:outline-none focus:ring-1 focus:ring-carbon/20";

const TARJETA_INTERNA = "rounded-lg border border-[#d8d8d8] bg-white";

const BOTON_PRIMARIO =
  "inline-flex items-center justify-center rounded-md bg-carbon px-3 py-2 text-xs font-bold uppercase tracking-wide text-white transition-colors hover:bg-carbon-suave focus:outline-none focus:ring-2 focus:ring-carbon/30 disabled:cursor-not-allowed disabled:opacity-40";

const BOTON_SECUNDARIO =
  "inline-flex items-center justify-center rounded-md border border-[#d8d8d8] bg-white px-3 py-2 text-xs font-bold uppercase tracking-wide text-[#4a555a] transition-colors hover:bg-gris-claro focus:outline-none focus:ring-2 focus:ring-carbon/20 disabled:cursor-not-allowed disabled:opacity-40";

export function PanelVentas() {
  const v = useVentas();

  return (
    <div className="flex min-h-dvh flex-col bg-gris-pagina">
      <Encabezado
        sobreTitulo="Panel de Ventas · Disagro"
        anchoClase={ANCHO_PANEL}
        enlaceDerecha={
          <a
            href="#/"
            onClick={() => window.scrollTo(0, 0)}
            className="shrink-0 text-xs font-bold text-white/70 transition-colors hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-hoja"
          >
            ← Volver al formulario
          </a>
        }
      />

      <main
        className={`mx-auto w-full ${ANCHO_PANEL} flex-1 px-4 py-8 sm:px-6 lg:py-10`}
      >
        <div className="flex flex-col gap-1 border-b border-[#d8d8d8] pb-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#9aa0a5]">
            Panel interno · Feria de promociones
          </p>
          <h1 className="text-xl font-black tracking-tight text-[#2d3436]">
            Confirmaciones de la feria
          </h1>
          <p className="text-sm text-[#6b7280]">
            Consulte las confirmaciones de asistencia, filtre por fecha u ítem
            del catálogo y exporte los resultados.
          </p>
        </div>

        <div className="mt-6">
          {v.estado === "comprobando" && (
            <EstadoCentral>
              <p className="text-sm text-[#6b7280]">Verificando la sesión…</p>
            </EstadoCentral>
          )}

          {v.estado === "error" && (
            <EstadoCentral>
              <div className="flex flex-col items-center gap-3">
                <p
                  role="alert"
                  className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-center text-sm font-medium text-red-700"
                >
                  No se pudo verificar la sesión.{" "}
                  {v.sesionQuery.error instanceof Error
                    ? v.sesionQuery.error.message
                    : "Inténtelo de nuevo."}
                </p>
                <button
                  type="button"
                  onClick={v.reiniciarSesion}
                  className={BOTON_PRIMARIO}
                >
                  Reintentar
                </button>
              </div>
            </EstadoCentral>
          )}

          {v.estado === "anonimo" && <LoginVentas v={v} />}

          {v.estado === "autenticado" && <ContenidoVentas v={v} />}
        </div>
      </main>

      <Pie />
    </div>
  );
}

function EstadoCentral({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      {children}
    </div>
  );
}

function LoginVentas({ v }: { v: Ventas }) {
  return (
    <div className="mx-auto flex max-w-sm flex-col gap-4">
      <div className={`${TARJETA_INTERNA} flex flex-col gap-4 p-5`}>
        <div className="flex flex-col gap-1">
          <h2 className="text-sm font-bold uppercase tracking-wide text-[#2d3436]">
            Acceso del equipo de Ventas
          </h2>
          <p className="text-xs leading-snug text-[#6b7280]">
            Ingrese con las credenciales de la campaña para consultar y exportar
            las confirmaciones.
          </p>
        </div>

        <form
          className="flex flex-col gap-3"
          onSubmit={v.iniciarSesion}
          noValidate
        >
          <Controller
            control={v.controlLogin}
            name="username"
            render={({ field, fieldState }) => (
              <CampoInterno
                id="ventas-usuario"
                etiqueta="Usuario"
                placeholder="Ingrese su usuario"
                autoCompletar="username"
                valor={field.value}
                onCambio={field.onChange}
                error={fieldState.error?.message}
              />
            )}
          />
          <Controller
            control={v.controlLogin}
            name="password"
            render={({ field, fieldState }) => (
              <CampoInterno
                id="ventas-contrasena"
                etiqueta="Contraseña"
                placeholder="Ingrese su contraseña"
                autoCompletar="current-password"
                tipo="password"
                valor={field.value}
                onCambio={field.onChange}
                error={fieldState.error?.message}
              />
            )}
          />

          {v.loginError !== null && (
            <p
              role="alert"
              className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-center text-xs font-medium text-red-700"
            >
              {v.loginError}
            </p>
          )}

          <button
            type="submit"
            disabled={v.loginEnviando}
            className={`${BOTON_PRIMARIO} w-full`}
          >
            {v.loginEnviando ? "Ingresando…" : "Ingresar"}
          </button>
        </form>
      </div>
    </div>
  );
}

type PropsCampoInterno = {
  id: string;
  etiqueta: string;
  placeholder?: string;
  valor: string;
  onCambio: (valor: string) => void;
  tipo?: "text" | "password";
  autoCompletar?: string;
  error?: string;
};

function CampoInterno({
  id,
  etiqueta,
  placeholder,
  valor,
  onCambio,
  tipo = "text",
  autoCompletar,
  error,
}: PropsCampoInterno) {
  return (
    <label htmlFor={id} className="flex flex-col gap-1">
      <span className={ETIQUETA_INTERNA}>{etiqueta}</span>
      <input
        id={id}
        type={tipo}
        autoComplete={autoCompletar}
        value={valor}
        onChange={(evento) => onCambio(evento.target.value)}
        placeholder={placeholder}
        aria-invalid={error !== undefined}
        className={`${CAMPO_INTERNO} ${
          error
            ? "border-red-400 focus:border-red-400 focus:ring-red-200"
            : ""
        }`}
      />
      {error !== undefined && (
        <span className="text-[11px] font-medium text-red-600">{error}</span>
      )}
    </label>
  );
}

function ContenidoVentas({ v }: { v: Ventas }) {
  const confirmaciones = v.listadoQuery.data?.confirmaciones ?? [];
  const resumen = v.listadoQuery.data?.resumen;
  const cargando = v.listadoQuery.isPending;
  const actualizando = cargando || v.listadoQuery.isPlaceholderData;
  const errorFiltros =
    v.listadoQuery.error instanceof Error ? v.listadoQuery.error.message : null;

  return (
    <div className="flex flex-col gap-5">
      <ResumenVentas resumen={resumen} actualizando={actualizando} />

      <FiltrosVentas v={v} />

      <section className="flex min-w-0 flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-bold uppercase tracking-wide text-[#4a555a]">
            Confirmaciones
          </h2>
          <div className="flex flex-col items-end gap-1.5">
            {v.errorExport !== null && (
              <p
                role="alert"
                className="rounded-md border border-red-300 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700"
              >
                {v.errorExport}
              </p>
            )}
            <button
              type="button"
              onClick={() => void v.exportarCsv()}
              disabled={v.exportando || confirmaciones.length === 0}
              className={BOTON_PRIMARIO}
            >
              {v.exportando ? "Exportando…" : "Exportar CSV"}
            </button>
          </div>
        </div>

        {errorFiltros !== null && (
          <p
            role="alert"
            className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm font-medium text-red-700"
          >
            La API rechazó los filtros: {errorFiltros}
          </p>
        )}

        <TablaConfirmaciones
          confirmaciones={confirmaciones}
          cargando={cargando}
          actualizando={actualizando}
        />
      </section>
    </div>
  );
}

function FiltrosVentas({ v }: { v: Ventas }) {
  return (
    <section className={`${TARJETA_INTERNA} flex flex-col gap-3 p-4`}>
      <h2 className="text-sm font-bold uppercase tracking-wide text-[#4a555a]">
        Filtros
      </h2>

      <div className="flex flex-wrap items-end gap-3">
        <CampoFechaInterno
          etiqueta="Evento desde"
          valor={v.filtrosFormulario.fechaDesde}
          onCambio={(valor) =>
            v.setFiltrosFormulario({
              ...v.filtrosFormulario,
              fechaDesde: valor,
            })
          }
        />
        <CampoFechaInterno
          etiqueta="Evento hasta"
          valor={v.filtrosFormulario.fechaHasta}
          onCambio={(valor) =>
            v.setFiltrosFormulario({
              ...v.filtrosFormulario,
              fechaHasta: valor,
            })
          }
        />
        <label className="flex min-w-[200px] flex-1 flex-col gap-1">
          <span className={ETIQUETA_INTERNA}>Ítem seleccionado</span>
          <select
            value={v.filtrosFormulario.catalogoItemId}
            onChange={(evento) =>
              v.setFiltrosFormulario({
                ...v.filtrosFormulario,
                catalogoItemId: evento.target.value,
              })
            }
            className={CAMPO_INTERNO}
          >
            <option value="">Todos los ítems</option>
            {(v.catalogoQuery.data ?? []).map((item) => (
              <option key={item.id} value={item.id}>
                {item.nombre}
              </option>
            ))}
          </select>
        </label>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={v.aplicarFiltros}
            className={BOTON_PRIMARIO}
          >
            Aplicar filtros
          </button>
          <button
            type="button"
            onClick={v.limpiarFiltros}
            disabled={filtrosVacios(v.filtrosFormulario)}
            className={BOTON_SECUNDARIO}
          >
            Limpiar
          </button>
        </div>
      </div>
    </section>
  );
}

function filtrosVacios(f: FiltrosFormulario): boolean {
  return f.fechaDesde === "" && f.fechaHasta === "" && f.catalogoItemId === "";
}

type PropsCampoFechaInterno = {
  etiqueta: string;
  valor: string;
  onCambio: (valor: string) => void;
};

function CampoFechaInterno({
  etiqueta,
  valor,
  onCambio,
}: PropsCampoFechaInterno) {
  return (
    <label className="flex min-w-[170px] flex-1 flex-col gap-1">
      <span className={ETIQUETA_INTERNA}>{etiqueta}</span>
      <input
        type="datetime-local"
        value={valor}
        onChange={(evento) => onCambio(evento.target.value)}
        className={CAMPO_INTERNO}
      />
    </label>
  );
}

function ResumenVentas({
  resumen,
  actualizando,
}: {
  resumen: VentasResumen | undefined;
  actualizando: boolean;
}) {
  return (
    <section className="grid gap-4 sm:grid-cols-2">
      <div className={`${TARJETA_INTERNA} flex flex-col gap-1 p-4`}>
        <p className={ETIQUETA_INTERNA}>Confirmaciones registradas</p>
        <p className="text-3xl font-black leading-none tabular-nums text-[#2d3436]">
          {resumen === undefined ? "—" : resumen.totalConfirmaciones}
        </p>
        <p className="text-xs text-[#9aa0a5]">
          {actualizando ? "Actualizando…" : "Total según los filtros aplicados"}
        </p>
      </div>

      <div className={`${TARJETA_INTERNA} flex flex-col gap-2 p-4`}>
        <p className={ETIQUETA_INTERNA}>Ítems más solicitados</p>
        {resumen === undefined ? (
          <p className="text-sm text-[#9aa0a5]">Consultando…</p>
        ) : resumen.topItems.length === 0 ? (
          <p className="text-sm text-[#9aa0a5]">Sin datos todavía.</p>
        ) : (
          <ul className="flex flex-col gap-1">
            {resumen.topItems.map((item) => (
              <li
                key={item.catalogoItemId}
                className="flex items-center gap-2 text-sm"
              >
                <span className="min-w-0 flex-1 truncate text-[#2d3436]">
                  {item.nombre}
                </span>
                <span className="shrink-0 rounded bg-gris-claro px-1.5 py-0.5 text-xs font-bold tabular-nums text-[#4a555a]">
                  ×{item.cantidad}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

type SubTotales = { servicios: number; productos: number };

function subtotales(fila: VentasConfirmacionFila): SubTotales {
  let servicios = 0;
  let productos = 0;
  for (const item of fila.items) {
    if (item.tipo === "SERVICIO") servicios += item.precioCongeladoCentavos;
    else productos += item.precioCongeladoCentavos;
  }
  return { servicios, productos };
}

function estimado(fila: VentasConfirmacionFila): number {
  const sub = subtotales(fila);
  const valor = sub.servicios + sub.productos;
  const descuentoServicios = Math.round(
    (sub.servicios * fila.descuentoServiciosPct) / 100,
  );
  const descuentoProductos = Math.round(
    (sub.productos * fila.descuentoProductosPct) / 100,
  );
  return valor - descuentoServicios - descuentoProductos;
}

function ahorro(fila: VentasConfirmacionFila): number {
  const sub = subtotales(fila);
  return sub.servicios + sub.productos - estimado(fila);
}

type ClaveOrden = "fecha" | "cliente" | "descuento" | "total";
type DireccionOrden = "asc" | "desc";
type Orden = { clave: ClaveOrden; direccion: DireccionOrden };

const FILAS_POR_PAGINA = 12;

function valorOrden(
  fila: VentasConfirmacionFila,
  clave: ClaveOrden,
): number | string {
  switch (clave) {
    case "fecha":
      return new Date(fila.fechaHoraEvento).getTime();
    case "cliente":
      return `${fila.cliente.nombre} ${fila.cliente.apellidos}`.toLocaleLowerCase(
        "es",
      );
    case "descuento":
      return ahorro(fila);
    case "total":
      return estimado(fila);
  }
}

function TablaConfirmaciones({
  confirmaciones,
  cargando,
  actualizando,
}: {
  confirmaciones: VentasConfirmacionFila[];
  cargando: boolean;
  actualizando: boolean;
}) {
  const [orden, setOrden] = useState<Orden | null>(null);
  const [pagina, setPagina] = useState(1);

  const filasOrdenadas = useMemo(() => {
    if (orden === null) return confirmaciones;
    const copia = [...confirmaciones];
    copia.sort((a, b) => {
      const va = valorOrden(a, orden.clave);
      const vb = valorOrden(b, orden.clave);
      const comparacion =
        typeof va === "number" && typeof vb === "number"
          ? va - vb
          : String(va).localeCompare(String(vb), "es");
      return orden.direccion === "asc" ? comparacion : -comparacion;
    });
    return copia;
  }, [confirmaciones, orden]);

  useEffect(() => {
    setPagina(1);
  }, [confirmaciones, orden]);

  const totalPaginas = Math.max(
    1,
    Math.ceil(filasOrdenadas.length / FILAS_POR_PAGINA),
  );
  const paginaActual = Math.min(pagina, totalPaginas);
  const inicio = (paginaActual - 1) * FILAS_POR_PAGINA;
  const filasPagina = filasOrdenadas.slice(inicio, inicio + FILAS_POR_PAGINA);

  function alternarOrden(clave: ClaveOrden): void {
    setOrden((anterior) =>
      anterior === null || anterior.clave !== clave
        ? { clave, direccion: "asc" }
        : {
            clave,
            direccion: anterior.direccion === "asc" ? "desc" : "asc",
          },
    );
  }

  if (cargando && confirmaciones.length === 0) {
    return (
      <div
        className={`${TARJETA_INTERNA} px-4 py-8 text-center text-sm text-[#6b7280]`}
      >
        Consultando las confirmaciones…
      </div>
    );
  }

  if (confirmaciones.length === 0) {
    return (
      <div className={`${TARJETA_INTERNA} px-4 py-10 text-center`}>
        <p className="text-sm font-semibold text-[#2d3436]">
          No hay confirmaciones para mostrar
        </p>
        <p className="mt-1 text-xs text-[#6b7280]">
          Ajuste o limpie los filtros para ver los registros de la feria.
        </p>
      </div>
    );
  }

  return (
    <div className={`${TARJETA_INTERNA} overflow-hidden`}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] border-collapse text-left text-[13px]">
          <caption className="sr-only">
            Confirmaciones de asistencia de los clientes
          </caption>
          <thead className="border-b border-[#d8d8d8] bg-gris-claro text-[11px] font-bold uppercase tracking-wide text-[#6b7280]">
            <tr>
              <EncabezadoOrdenable
                clave="fecha"
                etiqueta="Fecha del evento"
                orden={orden}
                onOrdenar={alternarOrden}
                className="w-[15%]"
              />
              <EncabezadoOrdenable
                clave="cliente"
                etiqueta="Cliente"
                orden={orden}
                onOrdenar={alternarOrden}
                className="w-[24%]"
              />
              <th scope="col" className="min-w-[200px] px-3 py-2.5">
                Selección
              </th>
              <EncabezadoOrdenable
                clave="descuento"
                etiqueta="Descuento"
                orden={orden}
                onOrdenar={alternarOrden}
                className="w-[14%]"
              />
              <EncabezadoOrdenable
                clave="total"
                etiqueta="Estimado"
                orden={orden}
                onOrdenar={alternarOrden}
                className="w-[15%]"
                derecha
              />
            </tr>
          </thead>
          <tbody
            className={`divide-y divide-[#eee] ${
              actualizando ? "opacity-60" : ""
            }`}
          >
            {filasPagina.map((fila) => (
              <FilaConfirmacion key={fila.id} fila={fila} />
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#e1e5e8] px-3 py-2.5 text-xs text-[#6b7280]">
        <span className="tabular-nums">
          Mostrando {inicio + 1}–{Math.min(inicio + FILAS_POR_PAGINA, filasOrdenadas.length)} de{" "}
          {filasOrdenadas.length}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPagina(paginaActual - 1)}
            disabled={paginaActual === 1}
            className={BOTON_SECUNDARIO}
          >
            Anterior
          </button>
          <span className="tabular-nums">
            Página {paginaActual} de {totalPaginas}
          </span>
          <button
            type="button"
            onClick={() => setPagina(paginaActual + 1)}
            disabled={paginaActual === totalPaginas}
            className={BOTON_SECUNDARIO}
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
}

function EncabezadoOrdenable({
  clave,
  etiqueta,
  orden,
  onOrdenar,
  className = "",
  derecha = false,
}: {
  clave: ClaveOrden;
  etiqueta: string;
  orden: Orden | null;
  onOrdenar: (clave: ClaveOrden) => void;
  className?: string;
  derecha?: boolean;
}) {
  const activa = orden?.clave === clave;
  const direccion = activa ? orden.direccion : null;
  const ariaSort =
    direccion === "asc"
      ? "ascending"
      : direccion === "desc"
        ? "descending"
        : "none";

  return (
    <th
      scope="col"
      aria-sort={ariaSort}
      className={`px-3 py-2.5 ${derecha ? "text-right" : ""} ${className}`}
    >
      <button
        type="button"
        onClick={() => onOrdenar(clave)}
        className={`inline-flex items-center gap-1 uppercase tracking-wide transition-colors hover:text-[#2d3436] focus:outline-none focus-visible:ring-2 focus-visible:ring-carbon/30 ${
          derecha ? "w-full justify-end" : ""
        } ${activa ? "text-[#2d3436]" : ""}`}
      >
        {etiqueta}
        <IconoChevron
          className={`h-3 w-3 shrink-0 transition-transform ${
            activa ? "opacity-100" : "opacity-30"
          } ${direccion === "asc" ? "rotate-180" : ""}`}
        />
      </button>
    </th>
  );
}

function FilaConfirmacion({ fila }: { fila: VentasConfirmacionFila }) {
  const sinDescuento =
    fila.descuentoServiciosPct === 0 && fila.descuentoProductosPct === 0;

  return (
    <tr className="align-top transition-colors hover:bg-gris-claro/60">
      <td className="whitespace-nowrap px-3 py-2.5 font-medium tabular-nums text-[#2d3436]">
        {formatoFechaLegible(fila.fechaHoraEvento)}
      </td>
      <td className="px-3 py-2.5">
        <span className="block font-bold text-[#2d3436]">
          {fila.cliente.nombre} {fila.cliente.apellidos}
        </span>
        <span className="block text-xs text-[#6b7280]">
          {fila.cliente.email}
        </span>
      </td>
      <td className="min-w-[200px] px-3 py-2.5">
        <details className="group">
          <summary className="w-fit cursor-pointer whitespace-nowrap rounded text-xs font-bold text-verde focus:outline-none focus:ring-2 focus:ring-verde/50">
            Ver detalle
          </summary>
          <ul className="mt-2 flex flex-col gap-1.5">
            {fila.items.map((item) => (
              <li
                key={item.catalogoItemId}
                className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-2 gap-y-1"
              >
                <EtiquetaTipo tipo={item.tipo} variante="claro" />
                <span className="min-w-0 text-xs leading-snug">
                  {item.nombreCongelado}
                </span>
                <span className="shrink-0 text-xs font-bold tabular-nums">
                  {formatearPrecioQ(item.precioCongeladoCentavos)}
                </span>
              </li>
            ))}
          </ul>
        </details>
      </td>
      <td className="px-3 py-2.5">
        {sinDescuento ? (
          <span className="text-xs text-[#9aa0a5]">Sin descuento</span>
        ) : (
          <div className="flex flex-wrap gap-1">
            {fila.descuentoServiciosPct > 0 && (
              <span className="rounded border border-hoja/40 bg-hoja/15 px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-hoja-oscuro">
                Servicios −{fila.descuentoServiciosPct}%
              </span>
            )}
            {fila.descuentoProductosPct > 0 && (
              <span className="rounded border border-hoja/40 bg-hoja/15 px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-hoja-oscuro">
                Productos −{fila.descuentoProductosPct}%
              </span>
            )}
          </div>
        )}
      </td>
      <td className="whitespace-nowrap px-3 py-2.5 text-right font-bold tabular-nums text-[#2d3436]">
        {formatearPrecioQ(estimado(fila))}
      </td>
    </tr>
  );
}

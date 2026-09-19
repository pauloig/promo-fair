import { Controller } from "react-hook-form";
import type {
  VentasConfirmacionFila,
  VentasResumen,
} from "@disagro/shared/schemas";
import { EtiquetaTipo } from "../components/EtiquetaTipo";
import { Pie } from "../components/Pie";
import { CampoTexto } from "../components/campos/CampoTexto";
import { CLASE_CAMPO, CLASE_ETIQUETA } from "../components/campos/estilos";
import { useVentas } from "../hooks/useVentas";
import type { FiltrosFormulario } from "../hooks/useVentas";
import { formatearPrecioQ } from "../lib/dinero";
import { formatoFechaLegible } from "../lib/fecha";

type Ventas = ReturnType<typeof useVentas>;

export function PanelVentas() {
  const v = useVentas();

  return (
    <div className="min-h-screen bg-gris-pagina">
      <CabeceraVentas />

      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:py-10">
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
                className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-center text-sm font-medium text-red-700"
              >
                No se pudo verificar la sesión.{" "}
                {v.sesionQuery.error instanceof Error
                  ? v.sesionQuery.error.message
                  : "Inténtelo de nuevo."}
              </p>
              <button
                type="button"
                onClick={v.reiniciarSesion}
                className="rounded-full bg-hoja px-4 py-1.5 text-xs font-bold text-carbon transition-colors hover:bg-hoja-oscuro focus:outline-none focus:ring-2 focus:ring-hoja"
              >
                Reintentar
              </button>
            </div>
          </EstadoCentral>
        )}

        {v.estado === "anonimo" && <LoginVentas v={v} />}

        {v.estado === "autenticado" && <ContenidoVentas v={v} />}
      </main>

      <Pie />
    </div>
  );
}

function CabeceraVentas() {
  return (
    <header className="bg-carbon text-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 lg:flex-row lg:items-end lg:justify-between lg:py-14">
        <div className="flex max-w-xl flex-col gap-3">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-hoja">
            Panel de Ventas · Disagro
          </p>
          <h1 className="text-3xl font-black leading-tight tracking-tight sm:text-4xl">
            Confirmaciones de la feria
          </h1>
          <p className="text-sm leading-relaxed text-white/70">
            Consulte las confirmaciones de asistencia de los clientes, filtre
            por fecha u ítem del catálogo y exporte los resultados.
          </p>
        </div>
        <a
          href="#/"
          onClick={() => window.scrollTo(0, 0)}
          className="shrink-0 rounded-full border border-white/25 px-4 py-2 text-xs font-bold text-white/80 transition-colors hover:border-white/50 hover:text-white focus:outline-none focus:ring-2 focus:ring-hoja/60"
        >
          ← Volver a la plataforma
        </a>
      </div>
    </header>
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
    <div className="mx-auto flex max-w-md flex-col gap-3">
      <div className="flex flex-col gap-4 rounded-2xl border border-[#e1e5e8] bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-black text-[#2d3436]">
            Acceso del equipo de Ventas
          </h2>
          <p className="text-sm leading-snug text-[#6b7280]">
            Ingrese con las credenciales de la campaña para consultar y exportar
            las confirmaciones.
          </p>
        </div>

        <form
          className="flex flex-col gap-4"
          onSubmit={v.iniciarSesion}
          noValidate
        >
          <Controller
            control={v.controlLogin}
            name="username"
            render={({ field, fieldState }) => (
              <CampoTexto
                id="ventas-usuario"
                etiqueta="Usuario:"
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
              <CampoTexto
                id="ventas-contrasena"
                etiqueta="Contraseña:"
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
              className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-center text-xs font-medium text-red-700"
            >
              {v.loginError}
            </p>
          )}

          <button
            type="submit"
            disabled={v.loginEnviando}
            className="w-full rounded-full bg-hoja px-6 py-3 text-sm font-black uppercase tracking-widest text-carbon shadow-md transition-all hover:bg-hoja-oscuro focus:outline-none focus:ring-2 focus:ring-hoja/60 disabled:cursor-not-allowed disabled:bg-white/5 disabled:text-[#9aa0a5] disabled:shadow-none"
          >
            {v.loginEnviando ? "Ingresando…" : "Ingresar"}
          </button>
        </form>
      </div>
    </div>
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
    <div className="grid items-start gap-8 lg:grid-cols-[340px_minmax(0,1fr)]">
      <div className="flex flex-col gap-6 lg:sticky lg:top-6">
        <FiltrosVentas v={v} />
        <ResumenVentas resumen={resumen} actualizando={actualizando} />
      </div>

      <section className="flex min-w-0 flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-black text-[#2d3436]">Confirmaciones</h2>
          <div className="flex flex-col items-end gap-1.5">
            {v.errorExport !== null && (
              <p
                role="alert"
                className="rounded-lg border border-red-300 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700"
              >
                {v.errorExport}
              </p>
            )}
            <button
              type="button"
              onClick={() => void v.exportarCsv()}
              disabled={v.exportando || confirmaciones.length === 0}
              className="rounded-full bg-carbon px-5 py-2 text-xs font-black uppercase tracking-widest text-white transition-colors hover:bg-carbon-suave focus:outline-none focus:ring-2 focus:ring-hoja/60 disabled:cursor-not-allowed disabled:bg-white/5 disabled:text-[#9aa0a5]"
            >
              {v.exportando ? "Exportando…" : "Exportar CSV"}
            </button>
          </div>
        </div>

        {errorFiltros !== null && (
          <p
            role="alert"
            className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm font-medium text-red-700"
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
    <section className="flex flex-col gap-4 rounded-2xl border border-[#e1e5e8] bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-1">
        <h2 className="text-base font-black text-[#2d3436]">Filtros</h2>
        <p className="text-xs leading-snug text-[#6b7280]">
          Acote el listado por fecha del evento o por un ítem del catálogo.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <CampoFechaVentas
          etiqueta="Evento desde"
          valor={v.filtrosFormulario.fechaDesde}
          onCambio={(valor) =>
            v.setFiltrosFormulario({
              ...v.filtrosFormulario,
              fechaDesde: valor,
            })
          }
        />
        <CampoFechaVentas
          etiqueta="Evento hasta"
          valor={v.filtrosFormulario.fechaHasta}
          onCambio={(valor) =>
            v.setFiltrosFormulario({
              ...v.filtrosFormulario,
              fechaHasta: valor,
            })
          }
        />
        <label className="flex flex-col gap-1.5">
          <span className={CLASE_ETIQUETA}>Ítem seleccionado</span>
          <select
            value={v.filtrosFormulario.catalogoItemId}
            onChange={(evento) =>
              v.setFiltrosFormulario({
                ...v.filtrosFormulario,
                catalogoItemId: evento.target.value,
              })
            }
            className={CLASE_CAMPO}
          >
            <option value="">Todos los ítems</option>
            {(v.catalogoQuery.data ?? []).map((item) => (
              <option key={item.id} value={item.id}>
                {item.nombre}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={v.aplicarFiltros}
          className="flex-1 rounded-full bg-carbon px-5 py-2.5 text-xs font-black uppercase tracking-widest text-white transition-colors hover:bg-carbon-suave focus:outline-none focus:ring-2 focus:ring-hoja/60"
        >
          Aplicar filtros
        </button>
        <button
          type="button"
          onClick={v.limpiarFiltros}
          disabled={filtrosVacios(v.filtrosFormulario)}
          className="rounded-full border border-[#d8d8d8] bg-white px-5 py-2.5 text-xs font-bold text-[#4a555a] transition-colors hover:bg-gris-claro focus:outline-none focus:ring-2 focus:ring-hoja/60 disabled:cursor-not-allowed disabled:text-[#b6bcc1]"
        >
          Limpiar
        </button>
      </div>
    </section>
  );
}

function filtrosVacios(f: FiltrosFormulario): boolean {
  return f.fechaDesde === "" && f.fechaHasta === "" && f.catalogoItemId === "";
}

type PropsCampoFechaVentas = {
  etiqueta: string;
  valor: string;
  onCambio: (valor: string) => void;
};

function CampoFechaVentas({
  etiqueta,
  valor,
  onCambio,
}: PropsCampoFechaVentas) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className={CLASE_ETIQUETA}>{etiqueta}</span>
      <input
        type="datetime-local"
        value={valor}
        onChange={(evento) => onCambio(evento.target.value)}
        className={CLASE_CAMPO}
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
  const total = resumen?.totalConfirmaciones;

  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-carbon p-6 text-white shadow-lg">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-black">Resumen</h2>
        {actualizando && !resumen ? (
          <span className="text-xs text-white/60">Consultando…</span>
        ) : null}
      </div>

      {resumen === undefined ? (
        <p className="text-sm text-white/60">Consultando los resultados…</p>
      ) : (
        <>
          <p className="text-4xl font-black leading-none text-hoja">
            {resumen.totalConfirmaciones}
          </p>
          <p className="text-sm text-white/70">
            {resumen.totalConfirmaciones === 1
              ? "confirmación"
              : "confirmaciones"}{" "}
            registradas
          </p>

          {resumen.topItems.length > 0 && (
            <div className="flex flex-col gap-2.5 border-t border-white/15 pt-4">
              <p className="text-sm font-bold text-white/80">
                Ítems más solicitados
              </p>
              <ul className="flex flex-col gap-2">
                {resumen.topItems.map((item) => (
                  <li
                    key={item.catalogoItemId}
                    className="flex items-center gap-2 text-sm"
                  >
                    <span className="min-w-0 flex-1 truncate text-white/90">
                      {item.nombre}
                    </span>
                    <span className="shrink-0 rounded-full bg-hoja/20 px-2 py-0.5 text-xs font-black text-hoja">
                      ×{item.cantidad}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
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

function etiquetaSeleccion(sub: SubTotales): string {
  const partes: string[] = [];
  if (sub.servicios > 0) {
    partes.push(
      `${sub.servicios} ${sub.servicios === 1 ? "servicio" : "servicios"}`,
    );
  }
  if (sub.productos > 0) {
    partes.push(
      `${sub.productos} ${sub.productos === 1 ? "producto" : "productos"}`,
    );
  }
  return partes.join(" y ");
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

function TablaConfirmaciones({
  confirmaciones,
  cargando,
  actualizando,
}: {
  confirmaciones: VentasConfirmacionFila[];
  cargando: boolean;
  actualizando: boolean;
}) {
  if (cargando && confirmaciones.length === 0) {
    return (
      <div className="rounded-xl border border-[#e1e5e8] bg-white px-4 py-8 text-center text-sm text-[#6b7280]">
        Consultando las confirmaciones…
      </div>
    );
  }

  if (confirmaciones.length === 0) {
    return (
      <div className="rounded-xl border border-[#e1e5e8] bg-white px-4 py-10 text-center">
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
    <div className="overflow-hidden rounded-xl border border-[#e1e5e8] bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] border-collapse text-left text-sm">
          <caption className="sr-only">
            Confirmaciones de asistencia de los clientes
          </caption>
          <thead className="bg-gris-claro text-xs font-bold text-[#4a555a]">
            <tr>
              <th scope="col" className="px-4 py-3">
                Fecha del evento
              </th>
              <th scope="col" className="px-4 py-3">
                Cliente
              </th>
              <th scope="col" className="px-4 py-3">
                Selección
              </th>
              <th scope="col" className="px-4 py-3">
                Descuento
              </th>
              <th scope="col" className="px-4 py-3 text-right">
                Estimado
              </th>
            </tr>
          </thead>
          <tbody
            className={`divide-y divide-[#eee] ${
              actualizando ? "opacity-60" : ""
            }`}
          >
            {confirmaciones.map((fila) => (
              <FilaConfirmacion key={fila.id} fila={fila} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FilaConfirmacion({ fila }: { fila: VentasConfirmacionFila }) {
  const sub = subtotales(fila);
  const sinDescuento =
    fila.descuentoServiciosPct === 0 && fila.descuentoProductosPct === 0;

  return (
    <tr className="align-top">
      <td className="whitespace-nowrap px-4 py-3 font-medium text-[#2d3436]">
        {formatoFechaLegible(fila.fechaHoraEvento)}
      </td>
      <td className="px-4 py-3">
        <span className="block font-bold text-[#2d3436]">
          {fila.cliente.nombre} {fila.cliente.apellidos}
        </span>
        <span className="block text-xs text-[#6b7280]">
          {fila.cliente.email}
        </span>
      </td>
      <td className="px-4 py-3">
        <details className="group">
          <summary className="w-fit cursor-pointer text-xs font-bold text-verde focus:outline-none focus:ring-2 focus:ring-verde/50 rounded">
            Ver {etiquetaSeleccion(sub)}
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
                <span className="shrink-0 text-xs font-bold">
                  {formatearPrecioQ(item.precioCongeladoCentavos)}
                </span>
              </li>
            ))}
          </ul>
        </details>
      </td>
      <td className="px-4 py-3">
        {sinDescuento ? (
          <span className="text-xs text-[#9aa0a5]">Sin descuento</span>
        ) : (
          <div className="flex flex-wrap gap-1">
            {fila.descuentoServiciosPct > 0 && (
              <span className="rounded-full border border-hoja/40 bg-hoja/15 px-2 py-0.5 text-[10px] font-bold text-hoja-oscuro">
                Servicios −{fila.descuentoServiciosPct}%
              </span>
            )}
            {fila.descuentoProductosPct > 0 && (
              <span className="rounded-full border border-hoja/40 bg-hoja/15 px-2 py-0.5 text-[10px] font-bold text-hoja-oscuro">
                Productos −{fila.descuentoProductosPct}%
              </span>
            )}
          </div>
        )}
      </td>
      <td className="whitespace-nowrap px-4 py-3 text-right font-bold text-[#2d3436]">
        {formatearPrecioQ(estimado(fila))}
      </td>
    </tr>
  );
}

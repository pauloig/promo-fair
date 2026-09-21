import { Encabezado } from "../components/Encabezado";
import { EncabezadoSeccion } from "../components/EncabezadoSeccion";
import { EtiquetaTipo } from "../components/EtiquetaTipo";
import { FormularioDatos } from "../components/FormularioDatos";
import { IconoCheck, IconoLupa } from "../components/Iconos";
import { PantallaCargaInicial } from "../components/PantallaCargaInicial";
import { PantallaConfirmada } from "../components/PantallaConfirmada";
import { Pie } from "../components/Pie";
import { useConfirmacion } from "../hooks/useConfirmacion";
import type { CatalogoItem, TipoItem } from "../lib/catalogo";
import { formatearPrecioQ } from "../lib/dinero";
import { formatoFechaLegible } from "../lib/fecha";
import { UMBRAL_SERVICIOS_CENTAVOS } from "../lib/descuentos";
import type { ResumenCategoria } from "../lib/descuentos";

const TITULO_POR_TIPO: Record<TipoItem, string> = {
  SERVICIO: "Servicios",
  PRODUCTO: "Productos",
};

type Umbral = {
  meta: string;
  progreso: number;
  estado: string;
  pista: string;
};

function umbrales(tipo: TipoItem, categoria: ResumenCategoria): Umbral[] {
  if (tipo === "SERVICIO") {
    const faltanTres = 2 - categoria.cantidad;
    return [
      {
        meta: "2 o más servicios",
        progreso: Math.min(100, (categoria.cantidad / 2) * 100),
        estado:
          categoria.porcentaje >= 3
            ? "✓ 3% aplicado"
            : `${categoria.cantidad}/2`,
        pista:
          categoria.porcentaje >= 3
            ? ""
            : `Seleccione ${faltanTres} ${faltanTres === 1 ? "servicio más" : "servicios más"} para el 3%.`,
      },
      {
        meta: "Suma superior a Q1,500",
        progreso: Math.min(
          100,
          (categoria.subtotalCentavos / UMBRAL_SERVICIOS_CENTAVOS) * 100,
        ),
        estado:
          categoria.porcentaje >= 5
            ? "✓ 5% aplicado"
            : `${Math.round((categoria.subtotalCentavos / UMBRAL_SERVICIOS_CENTAVOS) * 100)}%`,
        pista:
          categoria.porcentaje >= 5
            ? ""
            : categoria.cantidad < 2
              ? "Requiere 2 o más servicios seleccionados"
              : `Faltan ${formatearPrecioQ(UMBRAL_SERVICIOS_CENTAVOS - categoria.subtotalCentavos)} para el 5%.`,
      },
    ];
  }

  const faltanTresP = 3 - categoria.cantidad;
  const faltanCincoP = 5 - categoria.cantidad;
  return [
    {
      meta: "3 o más productos",
      progreso: Math.min(100, (categoria.cantidad / 3) * 100),
      estado:
        categoria.porcentaje >= 3 ? "✓ 3% aplicado" : `${categoria.cantidad}/3`,
      pista:
        categoria.porcentaje >= 3
          ? ""
          : `Seleccione ${faltanTresP} ${faltanTresP === 1 ? "producto más" : "productos más"} para el 3%.`,
    },
    {
      meta: "5 o más productos",
      progreso: Math.min(100, (categoria.cantidad / 5) * 100),
      estado:
        categoria.porcentaje >= 5 ? "✓ 5% aplicado" : `${categoria.cantidad}/5`,
      pista:
        categoria.porcentaje >= 5
          ? ""
          : `Seleccione ${faltanCincoP} ${faltanCincoP === 1 ? "producto más" : "productos más"} para el 5%.`,
    },
  ];
}

export function PantallaFormulario() {
  const c = useConfirmacion();

  if (c.recuperando) {
    return <PantallaCargaInicial />;
  }

  if (c.mostrarConfirmacion && c.resumenAMostrar !== null) {
    return (
      <PantallaConfirmada
        resumen={c.resumenAMostrar}
        nombre={c.nombre}
        onEditar={c.editar}
      />
    );
  }

  const pasos = [
    { numero: 1, etiqueta: "Datos", activo: c.datosCompletos },
    { numero: 2, etiqueta: "Selección", activo: c.seleccionados.size > 0 },
    { numero: 3, etiqueta: "Confirmar", activo: c.confirmada },
  ];

  const ahorroTotal =
    c.resumen.totalAntesCentavos - c.resumen.totalDespuesCentavos;

  const notaEvento =
    c.rango !== null
      ? `El evento se realiza entre el ${formatoFechaLegible(
          c.rango.fechaInicio,
        )} y el ${formatoFechaLegible(c.rango.fechaFin)}`
      : (c.rangoError ?? "Consultando el rango de fecha del evento…");

  return (
    <div className="min-h-screen bg-gris-pagina">
      <Encabezado
        sobreTitulo="Disagro"
        titulo="La feria, a su medida"
        descripcion="Confirme su asistencia, seleccione los servicios y productos de su interés y observe cómo su descuento crece en tiempo real con cada selección."
        nota={notaEvento}
        enlaceDerecha={
          <a
            href="#/ventas"
            onClick={() => window.scrollTo(0, 0)}
            className="shrink-0 text-xs font-bold text-white/70 transition-colors hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-hoja"
          >
            Panel de Ventas →
          </a>
        }
        acciones={
          <ol
            className="flex items-center gap-2"
            aria-label="Progreso del formulario"
          >
            {pasos.map((paso, indice) => (
              <li key={paso.numero} className="flex items-center gap-2">
                {indice > 0 && (
                  <span className="h-px w-5 bg-white/30 sm:w-8" />
                )}
                <span
                  className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold ${
                    paso.activo
                      ? "border-hoja bg-hoja text-carbon"
                      : "border-white/25 text-white/60"
                  }`}
                >
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${
                      paso.activo ? "bg-carbon text-hoja" : "bg-white/10"
                    }`}
                  >
                    {paso.activo ? (
                      <IconoCheck className="h-3 w-3" />
                    ) : (
                      paso.numero
                    )}
                  </span>
                  {paso.etiqueta}
                </span>
              </li>
            ))}
          </ol>
        }
      />

      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:py-10">
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="flex min-w-0 flex-col gap-10">
            <FormularioDatos
              control={c.control}
              errores={c.errores}
              rango={c.rango}
              disposicion="cuadricula"
            />

            <section className="flex flex-col gap-3">
              <EncabezadoSeccion numero={2} titulo="Arme su selección" />

              <div className="relative">
                <input
                  type="search"
                  value={c.busqueda}
                  onChange={(evento) => c.setBusqueda(evento.target.value)}
                  placeholder="Buscar Servicios y Productos"
                  aria-label="Buscar Servicios y Productos"
                  className="h-11 w-full rounded-full border border-linea-input bg-white pl-4 pr-12 text-sm text-[#2d3436] placeholder:text-[#6b7280] transition-colors hover:border-[#bcc3c9] focus:border-verde focus:outline-none focus:ring-2 focus:ring-verde/50"
                />
                <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-[#6b7280]">
                  <IconoLupa />
                </span>
              </div>

              {c.catalogoCargando ? (
                <div className="rounded-xl border border-[#e1e5e8] bg-white px-4 py-6 text-center text-sm text-[#6b7280]">
                  Consultando el catálogo…
                </div>
              ) : c.catalogoError !== null ? (
                <div className="flex flex-col items-center gap-2 rounded-xl border border-hoja/40 bg-hoja/10 px-4 py-6 text-center text-sm text-[#2d3436]">
                  <span>No se pudo cargar el catálogo. {c.catalogoError}</span>
                  <button
                    type="button"
                    onClick={c.reintentarCatalogo}
                    className="rounded-full bg-hoja px-4 py-1.5 text-xs font-bold text-carbon transition-colors hover:bg-hoja-oscuro focus:outline-none focus:ring-2 focus:ring-hoja"
                  >
                    Reintentar
                  </button>
                </div>
              ) : c.catalogoSinResultados ? (
                <p className="rounded-xl border border-[#e1e5e8] bg-white px-4 py-6 text-center text-sm text-[#6b7280]">
                  {c.busqueda.trim() === ""
                    ? "El catálogo está vacío."
                    : `No se encontró ningún elemento para “${c.busqueda}”.`}
                </p>
              ) : (
                <div className="flex flex-col gap-6">
                  {(["SERVICIO", "PRODUCTO"] as TipoItem[]).map((tipo) => {
                    const items = c.filtrados.filter(
                      (item) => item.tipo === tipo,
                    );
                    if (items.length === 0) return null;
                    const categoria =
                      tipo === "SERVICIO"
                        ? c.resumen.servicios
                        : c.resumen.productos;
                    const umbral = umbrales(tipo, categoria);
                    return (
                      <GrupoSeleccion
                        key={tipo}
                        tipo={tipo}
                        items={items}
                        categoria={categoria}
                        umbrales={umbral}
                        alternar={c.alternarItem}
                        seleccionados={c.seleccionados}
                      />
                    );
                  })}
                </div>
              )}
            </section>
          </div>

          <aside className="lg:sticky lg:top-40 lg:max-h-[calc(100vh-11rem)] lg:overflow-y-auto">
            <ResumenPanel
              totalAntes={c.resumen.totalAntesCentavos}
              totalDespues={c.resumen.totalDespuesCentavos}
              ahorroTotal={ahorroTotal}
              servicios={c.resumen.servicios}
              productos={c.resumen.productos}
              puedeConfirmar={c.puedeConfirmar}
              pistaBloqueo={c.pistaBloqueo}
              enviando={c.enviando}
              errorEnvio={c.errorEnvio}
              onConfirmar={c.confirmar}
            />
          </aside>
        </div>
      </main>

      <Pie />
    </div>
  );
}

type PropsGrupo = {
  tipo: TipoItem;
  items: CatalogoItem[];
  categoria: ResumenCategoria;
  umbrales: Umbral[];
  seleccionados: ReadonlySet<string>;
  alternar: (id: string) => void;
};

function GrupoSeleccion({
  tipo,
  items,
  categoria,
  umbrales,
  seleccionados,
  alternar,
}: PropsGrupo) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-base font-black text-[#2d3436]">
          {TITULO_POR_TIPO[tipo]}
        </h3>
        <span className="rounded-full bg-verde/15 px-3 py-1 text-xs font-bold text-verde">
          {categoria.cantidad}{" "}
          {categoria.cantidad === 1 ? "elegido" : "elegidos"}
        </span>
      </div>

      <div className="rounded-xl border border-[#e1e5e8] bg-white p-4 shadow-sm">
        <ul className="flex flex-col gap-3">
          {umbrales.map((umbral) => (
            <li key={umbral.meta} className="flex flex-col gap-1.5">
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-xs font-semibold text-[#4a555a]">
                  {umbral.meta}
                </span>
                <span
                  className={`shrink-0 text-xs font-bold ${
                    umbral.progreso >= 100 && umbral.estado.startsWith("✓")
                      ? "text-verde"
                      : "text-[#6b7280]"
                  }`}
                >
                  {umbral.estado}
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-gris-pagina">
                <div
                  style={{ width: `${umbral.progreso}%` }}
                  className={`h-full rounded-full transition-all duration-300 ${
                    umbral.estado.startsWith("✓") ? "bg-verde" : "bg-hoja"
                  }`}
                />
              </div>
              {umbral.pista !== "" && (
                <p className="text-[11px] leading-snug text-[#6b7280]">
                  {umbral.pista}
                </p>
              )}
            </li>
          ))}
        </ul>
      </div>

      <ul className="flex flex-col gap-2">
        {items.map((item) => {
          const seleccionado = seleccionados.has(item.id);
          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => alternar(item.id)}
                aria-pressed={seleccionado}
                className={`grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-all active:scale-[0.99] ${
                  seleccionado
                    ? "border-verde/60 bg-verde/10"
                    : "border-[#e1e5e8] bg-white hover:border-verde/40 hover:bg-gris-claro focus:outline-none focus:ring-2 focus:ring-verde/50"
                }`}
              >
                <span
                  className={
                    seleccionado
                      ? "flex h-5 w-5 shrink-0 items-center justify-center rounded bg-verde text-white transition-transform"
                      : "flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 border-[#bcc3c9] text-transparent"
                  }
                >
                  <IconoCheck />
                </span>
                <span className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="text-sm leading-snug text-[#2d3436]">
                    {item.nombre}
                  </span>
                  <EtiquetaTipo tipo={item.tipo} variante="claro" />
                </span>
                <span className="shrink-0 whitespace-nowrap text-sm font-bold text-[#2d3436]">
                  {formatearPrecioQ(item.precioCentavos)}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

type PropsResumen = {
  totalAntes: number;
  totalDespues: number;
  ahorroTotal: number;
  servicios: ResumenCategoria;
  productos: ResumenCategoria;
  puedeConfirmar: boolean;
  pistaBloqueo: string;
  enviando: boolean;
  errorEnvio: string | null;
  onConfirmar: () => void;
};

function ResumenPanel({
  totalAntes,
  totalDespues,
  ahorroTotal,
  servicios,
  productos,
  puedeConfirmar,
  pistaBloqueo,
  enviando,
  errorEnvio,
  onConfirmar,
}: PropsResumen) {
  const seleccionNula = servicios.cantidad + productos.cantidad === 0;

  return (
    <div className="flex flex-col gap-5 rounded-2xl bg-carbon p-6 text-white shadow-lg">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-black">Resumen</h2>
        <span
          className={`rounded-full px-3 py-1 text-xs font-bold ${
            seleccionNula ? "bg-white/10 text-white/60" : "bg-hoja text-carbon"
          }`}
        >
          {seleccionNula
            ? "Sin selección"
            : `${servicios.cantidad + productos.cantidad} ítems`}
        </span>
      </div>

      <dl className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between gap-3 text-sm">
          <dt className="text-white/70">
            Servicios{" "}
            <span className="text-white/50">({servicios.cantidad})</span>
          </dt>
          <dd className="font-bold">
            {formatearPrecioQ(servicios.subtotalCentavos)}
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-3 text-sm">
          <dt className="text-white/70">
            Productos{" "}
            <span className="text-white/50">({productos.cantidad})</span>
          </dt>
          <dd className="font-bold">
            {formatearPrecioQ(productos.subtotalCentavos)}
          </dd>
        </div>
      </dl>

      <div className="flex flex-wrap gap-2">
        <span
          className={`rounded-full border px-3 py-1 text-xs font-bold ${
            servicios.porcentaje > 0
              ? "border-hoja/40 bg-hoja/15 text-hoja"
              : "border-white/20 text-white/50"
          }`}
        >
          Servicios −{servicios.porcentaje}%
        </span>
        <span
          className={`rounded-full border px-3 py-1 text-xs font-bold ${
            productos.porcentaje > 0
              ? "border-hoja/40 bg-hoja/15 text-hoja"
              : "border-white/20 text-white/50"
          }`}
        >
          Productos −{productos.porcentaje}%
        </span>
      </div>

      {ahorroTotal > 0 && (
        <p className="text-sm font-bold text-hoja">
          Ahorras {formatearPrecioQ(ahorroTotal)} con esta selección
        </p>
      )}

      <div className="flex flex-col gap-1 border-t border-white/15 pt-4">
        {ahorroTotal > 0 && (
          <p className="text-right text-xs text-white/50 line-through">
            {formatearPrecioQ(totalAntes)}
          </p>
        )}
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-sm text-white/70">Total estimado</span>
          <span className="text-2xl font-black text-hoja">
            {formatearPrecioQ(totalDespues)}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {errorEnvio !== null && (
          <p
            role="alert"
            className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-center text-xs font-medium text-red-700"
          >
            {errorEnvio}
          </p>
        )}
        <button
          type="button"
          onClick={onConfirmar}
          disabled={!puedeConfirmar}
          className={`w-full rounded-full px-6 py-3.5 text-sm font-black uppercase tracking-widest transition-all ${
            puedeConfirmar
              ? "bg-hoja text-carbon shadow-md hover:bg-hoja-oscuro focus:outline-none focus:ring-2 focus:ring-hoja/60"
              : "cursor-not-allowed border border-white/20 bg-white/5 text-white/40"
          }`}
        >
          {enviando ? "Enviando…" : "Confirmar asistencia"}
        </button>
        {!puedeConfirmar && !enviando && (
          <p className="text-center text-xs leading-snug text-white/50">
            {pistaBloqueo}
          </p>
        )}
      </div>

      <p
        role="note"
        className="text-center text-[11px] leading-snug text-white/50"
      >
        Vista previa en vivo del descuento: se consolida al enviar el
        formulario.
      </p>
    </div>
  );
}

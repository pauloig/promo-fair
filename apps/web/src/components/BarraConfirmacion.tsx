import { formatearQuetzales } from "../lib/dinero";
import type { ResumenDescuentos } from "../lib/descuentos";

type Props = {
  resumen: ResumenDescuentos;
  puedeConfirmar: boolean;
  pistaBloqueo: string;
  confirmada: boolean;
  nombre: string;
  onConfirmar: () => void;
};

const CHIP_BASE =
  "flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm";

export function BarraConfirmacion({
  resumen,
  puedeConfirmar,
  pistaBloqueo,
  confirmada,
  nombre,
  onConfirmar,
}: Props) {
  return (
    <footer className="perforacion fixed inset-x-0 bottom-0 bg-agro-900 text-papel">
      <div className="mx-auto w-full max-w-6xl px-4 py-4 sm:px-6">
        {confirmada ? (
          <div className="flex flex-wrap items-center justify-between gap-3" aria-live="polite">
            <div>
              <p className="text-lg font-black text-hoja-500">Asistencia confirmada</p>
              <p className="text-sm text-papel/75">
                Gracias{nombre.trim() ? `, ${nombre.trim().split(" ")[0]}` : ""}. Su total
                estimado con descuento es {formatearQuetzales(resumen.totalDespuesCentavos)}.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <span
                className={
                  resumen.servicios.porcentaje > 0
                    ? `${CHIP_BASE} border-hoja-500 bg-hoja-500/10 font-bold text-hoja-500`
                    : `${CHIP_BASE} border-papel/25 font-semibold text-papel/55`
                }
              >
                Servicios
                <span className="text-base font-black">
                  {resumen.servicios.porcentaje > 0
                    ? `−${resumen.servicios.porcentaje}%`
                    : "0%"}
                </span>
              </span>
              <span
                className={
                  resumen.productos.porcentaje > 0
                    ? `${CHIP_BASE} border-hoja-500 bg-hoja-500/10 font-bold text-hoja-500`
                    : `${CHIP_BASE} border-papel/25 font-semibold text-papel/55`
                }
              >
                Productos
                <span className="text-base font-black">
                  {resumen.productos.porcentaje > 0
                    ? `−${resumen.productos.porcentaje}%`
                    : "0%"}
                </span>
              </span>
            </div>

            <div
              className="flex flex-1 flex-wrap items-center justify-end gap-x-5 gap-y-2"
              aria-live="polite"
            >
              {resumen.totalAntesCentavos > resumen.totalDespuesCentavos && (
                <p className="order-2 text-xs text-papel/60 sm:order-1">
                  Ahorro estimado{" "}
                  <strong className="font-bold text-hoja-500">
                    {formatearQuetzales(
                      resumen.totalAntesCentavos - resumen.totalDespuesCentavos,
                    )}
                  </strong>
                </p>
              )}
              <div className="order-1 flex items-baseline justify-end gap-2 sm:order-2">
                {resumen.totalAntesCentavos > resumen.totalDespuesCentavos && (
                  <s className="text-sm text-papel/45">
                    {formatearQuetzales(resumen.totalAntesCentavos)}
                  </s>
                )}
                <span className="text-lg font-black tracking-tight text-hoja-500">
                  {formatearQuetzales(resumen.totalDespuesCentavos)}
                </span>
              </div>
              <button
                type="button"
                onClick={onConfirmar}
                disabled={!puedeConfirmar}
                className={
                  puedeConfirmar
                    ? "order-3 rounded-lg bg-hoja-500 px-5 py-3 text-sm font-black text-agro-950 hover:bg-hoja-600 focus:outline-none focus:ring-2 focus:ring-hoja-500/50 focus:ring-offset-2 focus:ring-offset-agro-900"
                    : "order-3 cursor-not-allowed rounded-lg bg-papel/25 px-5 py-3 text-sm font-black text-papel/50"
                }
              >
                Confirmar asistencia
              </button>
            </div>

            {!puedeConfirmar && (
              <p className="w-full text-xs text-papel/55" role="status">
                {pistaBloqueo}
              </p>
            )}
          </div>
        )}
      </div>
    </footer>
  );
}
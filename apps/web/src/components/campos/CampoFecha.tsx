import { formatoFechaLegible } from "../../lib/fecha";
import { CLASE_ETIQUETA } from "./estilos";

type Props = {
  valor: string;
  onCambio: (valor: string) => void;
  min?: string;
  max?: string;
  error?: string;
};

export function CampoFecha({ valor, onCambio, min, max, error }: Props) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className={CLASE_ETIQUETA}>Fecha y Hora:</span>
      <div className="relative focus-within:ring-2 focus-within:ring-verde/50 focus-within:ring-offset-1">
        <input
          type="datetime-local"
          value={valor}
          min={min}
          max={max}
          onChange={(evento) => onCambio(evento.target.value)}
          aria-label="Fecha y hora en que asistirá"
          aria-invalid={error !== undefined}
          className="h-11 w-full cursor-pointer rounded-lg border border-linea-input bg-white pl-3 pr-10 text-sm text-transparent caret-transparent transition-colors focus:border-verde focus:outline-none"
        />
        <span className="pointer-events-none absolute inset-y-0 left-3 right-9 flex items-center overflow-hidden">
          {valor ? (
            <span className="truncate text-[#2d3436]">
              {formatoFechaLegible(valor)}
            </span>
          ) : (
            <span className="text-[#6b7280]">
              Seleccione Fecha y Hora en que asistirá
            </span>
          )}
        </span>
      </div>
      {error !== undefined && (
        <p className="text-xs font-medium text-red-600">{error}</p>
      )}
    </div>
  );
}
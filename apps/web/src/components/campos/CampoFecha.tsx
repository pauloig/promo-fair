import { CLASE_CAMPO, CLASE_ETIQUETA } from "./estilos";

type Props = {
  valor: string;
  onCambio: (valor: string) => void;
  onBlur?: () => void;
  min?: string;
  max?: string;
  error?: string;
};

export function CampoFecha({
  valor,
  onCambio,
  onBlur,
  min,
  max,
  error,
}: Props) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className={CLASE_ETIQUETA}>Fecha y Hora:</span>
      <input
        type="datetime-local"
        value={valor}
        min={min}
        max={max}
        onChange={(evento) => onCambio(evento.target.value)}
        onBlur={onBlur}
        aria-label="Fecha y hora en que asistirá"
        aria-invalid={error !== undefined}
        className={`${CLASE_CAMPO} ${
          error ? "border-red-500 focus:border-red-500 focus:ring-red-200" : ""
        }`}
      />
      {error !== undefined && (
        <p className="text-xs font-medium text-red-600">{error}</p>
      )}
    </div>
  );
}

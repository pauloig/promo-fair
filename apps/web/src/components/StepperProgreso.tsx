import { IconoCheck } from "./Iconos";

export type EstadoPaso = "pendiente" | "activo" | "completado";

export type PasoProgreso = {
  numero: number;
  etiqueta: string;
  estado: EstadoPaso;
};

type Props = {
  pasos: PasoProgreso[];
};

export function StepperProgreso({ pasos }: Props) {
  const pasoActivo = pasos.find((paso) => paso.estado === "activo") ?? null;

  return (
    <div className="flex w-full flex-col gap-2">
      <ol
        className="flex w-full items-center"
        aria-label="Progreso del formulario"
      >
        {pasos.map((paso, indice) => (
          <li
            key={paso.numero}
            className="flex flex-1 items-center last:flex-none"
          >
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                paso.estado === "completado"
                  ? "bg-hoja text-carbon"
                  : paso.estado === "activo"
                    ? "border-2 border-hoja bg-carbon-suave text-hoja"
                    : "border border-white/25 bg-transparent text-white/50"
              }`}
            >
              {paso.estado === "completado" ? (
                <IconoCheck className="h-3.5 w-3.5" />
              ) : (
                paso.numero
              )}
            </span>
            {indice < pasos.length - 1 && (
              <span
                className={`mx-1 h-0.5 flex-1 ${
                  paso.estado === "completado"
                    ? "bg-hoja"
                    : paso.estado === "activo"
                      ? "bg-hoja/50"
                      : "bg-white/25"
                }`}
              />
            )}
          </li>
        ))}
      </ol>
      {pasoActivo !== null && (
        <p className="text-center text-xs font-semibold text-white/60">
          {pasoActivo.etiqueta}
        </p>
      )}
    </div>
  );
}
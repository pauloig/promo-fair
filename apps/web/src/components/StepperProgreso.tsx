import { IconoCheck } from "./Iconos";

export type EstadoPaso = "pendiente" | "activo" | "completado";

export type PasoProgreso = {
  numero: number;
  etiqueta: string;
  estado: EstadoPaso;
};

type Props = {
  pasos: PasoProgreso[];
  mostrarTodasLasEtiquetas?: boolean;
};

function claseCirculo(estado: EstadoPaso): string {
  if (estado === "completado") return "bg-hoja text-carbon";
  if (estado === "activo") return "border-2 border-hoja bg-carbon-suave text-hoja";
  return "border border-white/25 bg-transparent text-white/50";
}

function claseLinea(estado: EstadoPaso): string {
  if (estado === "completado") return "bg-hoja";
  if (estado === "activo") return "bg-hoja/50";
  return "bg-white/25";
}

export function StepperProgreso({
  pasos,
  mostrarTodasLasEtiquetas = false,
}: Props) {
  return (
    <ol className="flex w-full items-start" aria-label="Progreso del formulario">
      {pasos.map((paso, indice) => {
        const esPrimero = indice === 0;
        const esUltimo = indice === pasos.length - 1;
        const mostrarEtiqueta =
          mostrarTodasLasEtiquetas || paso.estado === "activo";

        return (
          <li
            key={paso.numero}
            className="flex flex-1 flex-col items-center gap-1.5"
          >
            <div className="flex w-full items-center">
              {esPrimero ? (
                <span className="flex-1" aria-hidden="true" />
              ) : (
                <span
                  className={`h-0.5 flex-1 ${claseLinea(pasos[indice - 1].estado)}`}
                />
              )}
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${claseCirculo(
                  paso.estado,
                )}`}
              >
                {paso.estado === "completado" ? (
                  <IconoCheck className="h-3.5 w-3.5" />
                ) : (
                  paso.numero
                )}
              </span>
              {esUltimo ? (
                <span className="flex-1" aria-hidden="true" />
              ) : (
                <span className={`h-0.5 flex-1 ${claseLinea(paso.estado)}`} />
              )}
            </div>
            {mostrarEtiqueta && (
              <span className="text-center text-xs font-semibold text-white/60">
                {paso.etiqueta}
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}

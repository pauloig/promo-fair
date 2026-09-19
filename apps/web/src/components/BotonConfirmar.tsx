import { IconoFlecha } from "./Iconos";

type Props = {
  puedeConfirmar: boolean;
  pistaBloqueo: string;
  confirmada: boolean;
  nombre: string;
  onConfirmar: () => void;
};

export function BotonConfirmar({
  puedeConfirmar,
  pistaBloqueo,
  confirmada,
  nombre,
  onConfirmar,
}: Props) {
  if (confirmada) {
    return (
      <div
        className="mx-auto flex max-w-lg flex-col items-center gap-1 rounded-xl border border-verde/40 bg-verde/10 px-6 py-4 text-center"
        role="status"
      >
        <p className="text-base font-bold text-verde">¡Asistencia confirmada!</p>
        <p className="text-sm text-[#2d3436]">
          Gracias{nombre.trim() ? `, ${nombre.trim().split(" ")[0]}` : ""}. El equipo de
          Ventas preparará su portafolio de promociones.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={onConfirmar}
        disabled={!puedeConfirmar}
        className={
          puedeConfirmar
            ? "inline-flex items-center gap-2.5 rounded-lg bg-indigo-600 px-10 py-3 text-sm font-bold tracking-wide text-white transition hover:bg-indigo-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 active:scale-[0.98]"
            : "inline-flex cursor-not-allowed items-center gap-2.5 rounded-lg border border-[#8a9199] bg-[#9ca3af] px-10 py-3 text-sm font-bold tracking-wide text-[#3b434c]"
        }
      >
        CONFIRMAR ASISTENCIA
        <IconoFlecha />
      </button>
      {!puedeConfirmar && (
        <p role="status" className="text-xs text-[#6b7280]">
          {pistaBloqueo}
        </p>
      )}
    </div>
  );
}
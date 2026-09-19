import { IconoFlecha } from "./Iconos";

type Props = {
  puedeConfirmar: boolean;
  pistaBloqueo: string;
  enviando: boolean;
  errorEnvio: string | null;
  onConfirmar: () => void;
};

export function BotonConfirmar({
  puedeConfirmar,
  pistaBloqueo,
  enviando,
  errorEnvio,
  onConfirmar,
}: Props) {
  return (
    <div className="flex flex-col items-center gap-2">
      {errorEnvio !== null && (
        <p
          role="alert"
          className="max-w-xl rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-center text-xs font-medium text-red-700"
        >
          {errorEnvio}
        </p>
      )}
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
        {enviando ? "ENVIANDO…" : "CONFIRMAR ASISTENCIA"}
        <IconoFlecha />
      </button>
      {!puedeConfirmar && !enviando && (
        <p role="status" className="text-xs text-[#6b7280]">
          {pistaBloqueo}
        </p>
      )}
    </div>
  );
}

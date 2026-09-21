import type { ReactNode } from "react";

type Props = {
  sobreTitulo: string;
  titulo: string;
  descripcion: string;
  enlaceDerecha?: ReactNode;
  acciones?: ReactNode;
  nota?: ReactNode;
};

export function Encabezado({
  sobreTitulo,
  titulo,
  descripcion,
  enlaceDerecha,
  acciones,
  nota,
}: Props) {
  return (
    <header className="sticky top-0 z-40 bg-carbon text-white shadow-md">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-3 sm:px-6 lg:py-4">
        <div className="flex items-center justify-between gap-4">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-hoja">
            {sobreTitulo}
          </p>
          {enlaceDerecha !== undefined && enlaceDerecha}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex max-w-2xl flex-col gap-1">
            <h1 className="text-2xl font-black leading-tight tracking-tight">
              {titulo}
            </h1>
            <p className="text-sm leading-relaxed text-white/70">
              {descripcion}
            </p>
          </div>
          {acciones !== undefined && acciones}
        </div>

        {nota !== undefined && (
          <p className="text-xs leading-snug text-white/60">{nota}</p>
        )}
      </div>
    </header>
  );
}
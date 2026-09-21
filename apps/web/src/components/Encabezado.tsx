import type { ReactNode } from "react";

type Props = {
  sobreTitulo: string;
  nota?: ReactNode;
  enlaceDerecha?: ReactNode;
};

export function Encabezado({ sobreTitulo, nota, enlaceDerecha }: Props) {
  return (
    <header className="sticky top-0 z-40 bg-carbon text-white shadow-md">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-1 px-4 py-2 sm:px-6">
        <div className="flex items-center justify-between gap-4">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-hoja">
            {sobreTitulo}
          </p>
          {enlaceDerecha !== undefined && enlaceDerecha}
        </div>
        {nota !== undefined && (
          <p className="text-xs leading-snug text-white/60">{nota}</p>
        )}
      </div>
    </header>
  );
}
import type { ReactNode } from "react";

type Props = {
  sobreTitulo: string;
  nota?: ReactNode;
  enlaceDerecha?: ReactNode;
};

export function Encabezado({ sobreTitulo, nota, enlaceDerecha }: Props) {
  return (
    <header className="sticky top-0 z-40 bg-carbon text-white shadow-md">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-1.5 px-4 py-3 sm:px-6 sm:py-4 lg:py-5">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-hoja sm:text-base">
            {sobreTitulo}
          </p>
          {enlaceDerecha !== undefined && enlaceDerecha}
        </div>
        {nota !== undefined && (
          <p className="text-[17px] font-semibold leading-snug text-amber-300">
            {nota}
          </p>
        )}
      </div>
    </header>
  );
}
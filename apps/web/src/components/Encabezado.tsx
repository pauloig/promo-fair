import type { ReactNode } from "react";

type Props = {
  sobreTitulo: string;
  titulo: string;
  descripcion: string;
  acciones?: ReactNode;
};

export function Encabezado({
  sobreTitulo,
  titulo,
  descripcion,
  acciones,
}: Props) {
  return (
    <header className="bg-carbon text-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 lg:flex-row lg:items-end lg:justify-between lg:py-14">
        <div className="flex max-w-xl flex-col gap-3">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-hoja">
            {sobreTitulo}
          </p>
          <h1 className="text-3xl font-black leading-tight tracking-tight sm:text-4xl">
            {titulo}
          </h1>
          <p className="text-sm leading-relaxed text-white/70">
            {descripcion}
          </p>
        </div>
        {acciones !== undefined && acciones}
      </div>
    </header>
  );
}
import type { ReactNode } from "react";

type Props = {
  titulo: string;
  descripcion: string;
  acciones?: ReactNode;
};

export function Introduccion({ titulo, descripcion, acciones }: Props) {
  return (
    <div className="flex flex-col items-start gap-4">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-black leading-tight tracking-tight text-carbon sm:text-3xl">
          {titulo}
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-[#4a555a]">
          {descripcion}
        </p>
      </div>
      {acciones !== undefined && acciones}
    </div>
  );
}
type Props = {
  numero: number;
  titulo: string;
};

export function EncabezadoSeccion({ numero, titulo }: Props) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-verde text-sm font-bold text-white">
        {numero}
      </span>
      <h2 className="text-base font-bold leading-snug text-[#2d3436]">{titulo}</h2>
    </div>
  );
}
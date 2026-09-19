import { CLASE_CAMPO, CLASE_ETIQUETA } from "./estilos";

type Props = {
  id: string;
  etiqueta: string;
  placeholder: string;
  autoCompletar?: string;
  tipo?: "text" | "email";
  valor: string;
  onCambio: (valor: string) => void;
  anchoClase?: string;
  error?: string;
};

export function CampoTexto({
  id,
  etiqueta,
  placeholder,
  autoCompletar,
  tipo = "text",
  valor,
  onCambio,
  anchoClase = "w-full",
  error,
}: Props) {
  return (
    <label htmlFor={id} className={`flex flex-col gap-1.5 ${anchoClase}`}>
      <span className={CLASE_ETIQUETA}>{etiqueta}</span>
      <input
        id={id}
        type={tipo}
        autoComplete={autoCompletar}
        required
        value={valor}
        onChange={(evento) => onCambio(evento.target.value)}
        placeholder={placeholder}
        aria-invalid={error !== undefined}
        className={`${CLASE_CAMPO} ${anchoClase} ${
          error ? "border-red-500 focus:border-red-500 focus:ring-red-200" : ""
        }`}
      />
      {error !== undefined && (
        <span className="text-xs font-medium text-red-600">{error}</span>
      )}
    </label>
  );
}

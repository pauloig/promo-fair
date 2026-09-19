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
        className={`${CLASE_CAMPO} ${anchoClase}`}
      />
    </label>
  );
}
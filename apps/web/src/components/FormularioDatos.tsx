import type { DatosCliente } from "../lib/datos";
import { formatoFechaLegible } from "../lib/fecha";
import { EncabezadoSeccion } from "./EncabezadoSeccion";
import { IconoCalendario, IconoChevron } from "./Iconos";

type Props = {
  valor: DatosCliente;
  onChange: (campo: keyof DatosCliente, valor: string) => void;
};

const CLASE_CAMPO =
  "h-11 w-full rounded-lg border border-linea-input bg-white px-3 text-sm text-[#2d3436] placeholder:text-[#9aa0a6] focus:border-carbon focus:outline-none";

const CLASE_ETIQUETA = "text-sm font-bold text-[#2d3436]";

export function FormularioDatos({ valor, onChange }: Props) {
  return (
    <section className="flex flex-col gap-3">
      <EncabezadoSeccion numero={1} titulo="Ingrese su información" />

      <div className="flex flex-col gap-4 rounded-xl border border-[#e1e5e8] bg-white p-5 shadow-sm">
        <CampoTexto
          id="nombre"
          etiqueta="Nombre:"
          placeholder="Introduzca su nombre"
          autoCompletar="given-name"
          valor={valor.nombre}
          onCambio={(v) => onChange("nombre", v)}
        />
        <CampoTexto
          id="apellidos"
          etiqueta="Apellidos:"
          placeholder="Introduzca sus apellidos"
          autoCompletar="family-name"
          valor={valor.apellidos}
          onCambio={(v) => onChange("apellidos", v)}
        />
        <CampoTexto
          id="correo"
          etiqueta="Email:"
          placeholder="Introduzca su Email"
          autoCompletar="email"
          tipo="email"
          valor={valor.correo}
          onCambio={(v) => onChange("correo", v)}
        />
        <CampoFecha valor={valor.fechaHora} onCambio={(v) => onChange("fechaHora", v)} />
      </div>
    </section>
  );
}

type PropsCampoTexto = {
  id: string;
  etiqueta: string;
  placeholder: string;
  autoCompletar?: string;
  tipo?: "text" | "email";
  valor: string;
  onCambio: (valor: string) => void;
};

function CampoTexto({
  id,
  etiqueta,
  placeholder,
  autoCompletar,
  tipo = "text",
  valor,
  onCambio,
}: PropsCampoTexto) {
  return (
    <label htmlFor={id} className="flex flex-col gap-1.5">
      <span className={CLASE_ETIQUETA}>{etiqueta}</span>
      <input
        id={id}
        type={tipo}
        autoComplete={autoCompletar}
        required
        value={valor}
        onChange={(evento) => onCambio(evento.target.value)}
        placeholder={placeholder}
        className={CLASE_CAMPO}
      />
    </label>
  );
}

function CampoFecha({
  valor,
  onCambio,
}: {
  valor: string;
  onCambio: (valor: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className={CLASE_ETIQUETA}>Fecha y Hora:</span>
      <div className="relative focus-within:ring-2 focus-within:ring-verde/40 focus-within:ring-offset-1">
        <input
          type="datetime-local"
          value={valor}
          onChange={(evento) => onCambio(evento.target.value)}
          className="h-11 w-full cursor-pointer rounded-lg border border-linea-input bg-white pl-3 pr-20 text-sm text-transparent caret-transparent focus:border-carbon focus:outline-none"
        />
        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center gap-1 text-sm">
          {valor ? (
            <span className="text-[#2d3436]">{formatoFechaLegible(valor)}</span>
          ) : (
            <span className="text-[#9aa0a6]">Seleccione Fecha y Hora en que asistirá</span>
          )}
        </span>
        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center gap-2 text-[#6b7280]">
          <IconoCalendario />
          <IconoChevron />
        </span>
      </div>
    </div>
  );
}
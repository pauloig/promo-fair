import type { DatosCliente } from "../lib/datos";
import { EncabezadoSeccion } from "./EncabezadoSeccion";
import { CampoFecha } from "./campos/CampoFecha";
import { CampoTexto } from "./campos/CampoTexto";

type Props = {
  valor: DatosCliente;
  onChange: (campo: keyof DatosCliente, valor: string) => void;
  disposicion?: "apilado" | "cuadricula";
};

export function FormularioDatos({ valor, onChange, disposicion = "apilado" }: Props) {
  const cuadricula = disposicion === "cuadricula";
  return (
    <section className="flex flex-col gap-3">
      <EncabezadoSeccion numero={1} titulo="Ingrese su información" />

      <div
        className={`rounded-xl border border-[#e1e5e8] bg-white p-5 shadow-sm ${
          cuadricula ? "grid grid-cols-1 gap-4 sm:grid-cols-2" : "flex flex-col gap-4"
        }`}
      >
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
        <div className={cuadricula ? "sm:col-span-1" : ""}>
          <CampoFecha valor={valor.fechaHora} onCambio={(v) => onChange("fechaHora", v)} />
        </div>
      </div>
    </section>
  );
}
import type { DatosCliente } from "../lib/datos";

type Props = {
  valor: DatosCliente;
  onChange: (campo: keyof DatosCliente, valor: string) => void;
};

const CLASE_INPUT =
  "w-full rounded-md border border-linea bg-white px-3 py-2 text-sm text-tinta placeholder:text-ceniza focus:border-agro-600 focus:outline-none focus:ring-2 focus:ring-agro-600/30";

export function FormularioDatos({ valor, onChange }: Props) {
  return (
    <section
      aria-labelledby="titulo-datos"
      className="flex flex-col gap-5 rounded-xl border border-linea bg-white p-5 shadow-sm"
    >
      <h2 id="titulo-datos" className="text-lg font-bold tracking-tight text-tinta">
        Sus datos
      </h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="nombre" className="text-sm font-semibold text-tinta">
            Nombre
          </label>
          <input
            id="nombre"
            type="text"
            autoComplete="given-name"
            required
            value={valor.nombre}
            onChange={(evento) => onChange("nombre", evento.target.value)}
            className={CLASE_INPUT}
            placeholder="Nombre"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="apellidos" className="text-sm font-semibold text-tinta">
            Apellidos
          </label>
          <input
            id="apellidos"
            type="text"
            autoComplete="family-name"
            required
            value={valor.apellidos}
            onChange={(evento) => onChange("apellidos", evento.target.value)}
            className={CLASE_INPUT}
            placeholder="Apellidos"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="correo" className="text-sm font-semibold text-tinta">
          Correo electrónico
        </label>
        <input
          id="correo"
          type="email"
          autoComplete="email"
          required
          value={valor.correo}
          onChange={(evento) => onChange("correo", evento.target.value)}
          className={CLASE_INPUT}
          placeholder="cliente@ejemplo.com"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="fechaHora" className="text-sm font-semibold text-tinta">
          Fecha y hora en que asistirá
        </label>
        <input
          id="fechaHora"
          type="datetime-local"
          required
          value={valor.fechaHora}
          onChange={(evento) => onChange("fechaHora", evento.target.value)}
          className={CLASE_INPUT}
        />
      </div>
    </section>
  );
}
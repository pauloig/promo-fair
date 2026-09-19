import { useMemo, useState } from "react";
import { Encabezado } from "./components/Encabezado";
import { FormularioDatos } from "./components/FormularioDatos";
import { PanelCatalogo } from "./components/PanelCatalogo";
import { BarraConfirmacion } from "./components/BarraConfirmacion";
import { CATALOGO } from "./lib/catalogo";
import { calcularDescuentos } from "./lib/descuentos";
import { DATOS_VACIOS } from "./lib/datos";
import type { DatosCliente } from "./lib/datos";

export default function App() {
  const [datosCliente, setDatosCliente] = useState<DatosCliente>(DATOS_VACIOS);
  const [seleccionados, setSeleccionados] = useState<ReadonlySet<string>>(new Set());
  const [confirmada, setConfirmada] = useState(false);

  const resumen = useMemo(
    () => calcularDescuentos(CATALOGO.filter((item) => seleccionados.has(item.id))),
    [seleccionados],
  );

  const datosCompletos =
    datosCliente.nombre.trim() !== "" &&
    datosCliente.apellidos.trim() !== "" &&
    datosCliente.correo.trim() !== "" &&
    datosCliente.fechaHora !== "";

  const puedeConfirmar = datosCompletos && seleccionados.size > 0;
  const pistaBloqueo =
    seleccionados.size === 0
      ? "Seleccione al menos un servicio o producto para confirmar."
      : "Complete los datos del formulario para confirmar.";

  function cambiarDato(campo: keyof DatosCliente, valor: string): void {
    setDatosCliente((anterior) => ({ ...anterior, [campo]: valor }));
  }

  function alternarItem(id: string): void {
    setSeleccionados((anterior) => {
      const siguiente = new Set(anterior);
      if (siguiente.has(id)) {
        siguiente.delete(id);
      } else {
        siguiente.add(id);
      }
      return siguiente;
    });
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Encabezado />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-64 pt-6 sm:px-6 sm:pb-56 md:pb-48 lg:pb-44">
        <div className="grid items-start gap-6 md:grid-cols-2 lg:grid-cols-[1fr_1.5fr]">
          <FormularioDatos valor={datosCliente} onChange={cambiarDato} />
          <PanelCatalogo seleccionados={seleccionados} onAlternar={alternarItem} />
        </div>
      </main>

      <BarraConfirmacion
        resumen={resumen}
        puedeConfirmar={puedeConfirmar}
        pistaBloqueo={pistaBloqueo}
        confirmada={confirmada}
        nombre={datosCliente.nombre}
        onConfirmar={() => setConfirmada(true)}
      />
    </div>
  );
}
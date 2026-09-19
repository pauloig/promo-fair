import { useMemo, useState } from "react";
import { BotonConfirmar } from "./components/BotonConfirmar";
import { Encabezado } from "./components/Encabezado";
import { FormularioDatos } from "./components/FormularioDatos";
import { PanelCatalogo } from "./components/PanelCatalogo";
import { Pie } from "./components/Pie";
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
      : "Complete los campos del formulario para confirmar.";

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
    <div className="min-h-screen bg-gris-pagina px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto w-full max-w-6xl overflow-hidden rounded-2xl bg-gris-claro shadow-lg">
        <Encabezado />

        <main className="flex flex-col gap-8 px-6 py-6 sm:px-8">
          <div className="grid items-start gap-8 md:grid-cols-2">
            <FormularioDatos valor={datosCliente} onChange={cambiarDato} />
            <PanelCatalogo
              seleccionados={seleccionados}
              onAlternar={alternarItem}
              resumen={resumen}
            />
          </div>

          <BotonConfirmar
            puedeConfirmar={puedeConfirmar}
            pistaBloqueo={pistaBloqueo}
            confirmada={confirmada}
            nombre={datosCliente.nombre}
            onConfirmar={() => setConfirmada(true)}
          />
        </main>

        <Pie />
      </div>
    </div>
  );
}
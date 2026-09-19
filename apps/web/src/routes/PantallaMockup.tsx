import { BotonConfirmar } from "../components/BotonConfirmar";
import { Encabezado } from "../components/Encabezado";
import { FormularioDatos } from "../components/FormularioDatos";
import { PanelCatalogo } from "../components/PanelCatalogo";
import { Pie } from "../components/Pie";
import { useConfirmacion } from "../hooks/useConfirmacion";

export function PantallaMockup() {
  const confirmacion = useConfirmacion();

  return (
    <div className="min-h-screen bg-gris-pagina px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto w-full max-w-6xl overflow-hidden rounded-2xl bg-gris-claro shadow-lg">
        <Encabezado />

        <main className="flex flex-col gap-8 px-6 py-6 sm:px-8">
          <div className="grid items-start gap-8 md:grid-cols-2">
            <FormularioDatos valor={confirmacion.datosCliente} onChange={confirmacion.cambiarDato} />
            <PanelCatalogo
              filtrados={confirmacion.filtrados}
              busqueda={confirmacion.busqueda}
              onCambioBusqueda={confirmacion.setBusqueda}
              seleccionados={confirmacion.seleccionados}
              onAlternar={confirmacion.alternarItem}
              resumen={confirmacion.resumen}
            />
          </div>

          <BotonConfirmar
            puedeConfirmar={confirmacion.puedeConfirmar}
            pistaBloqueo={confirmacion.pistaBloqueo}
            confirmada={confirmacion.confirmada}
            nombre={confirmacion.datosCliente.nombre}
            onConfirmar={confirmacion.confirmar}
          />
        </main>

        <Pie />
      </div>
    </div>
  );
}
import { BotonConfirmar } from "../components/BotonConfirmar";
import { Encabezado } from "../components/Encabezado";
import { FormularioDatos } from "../components/FormularioDatos";
import { PanelCatalogo } from "../components/PanelCatalogo";
import { PantallaCargaInicial } from "../components/PantallaCargaInicial";
import { PantallaConfirmada } from "../components/PantallaConfirmada";
import { Pie } from "../components/Pie";
import { useConfirmacion } from "../hooks/useConfirmacion";

export function PantallaMockup() {
  const confirmacion = useConfirmacion();

  if (confirmacion.recuperando) {
    return <PantallaCargaInicial />;
  }

  if (
    confirmacion.mostrarConfirmacion &&
    confirmacion.resumenAMostrar !== null
  ) {
    return (
      <PantallaConfirmada
        resumen={confirmacion.resumenAMostrar}
        nombre={confirmacion.nombre}
        onEditar={confirmacion.editar}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gris-pagina px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto w-full max-w-6xl overflow-hidden rounded-2xl bg-gris-claro shadow-lg">
        <Encabezado />

        <main className="flex flex-col gap-8 px-6 py-6 sm:px-8">
          <div className="grid items-start gap-8 md:grid-cols-2">
            <FormularioDatos
              control={confirmacion.control}
              errores={confirmacion.errores}
              rango={confirmacion.rango}
              rangoError={confirmacion.rangoError}
            />
            <PanelCatalogo
              filtrados={confirmacion.filtrados}
              busqueda={confirmacion.busqueda}
              onCambioBusqueda={confirmacion.setBusqueda}
              seleccionados={confirmacion.seleccionados}
              onAlternar={confirmacion.alternarItem}
              resumen={confirmacion.resumen}
              cargando={confirmacion.catalogoCargando}
              error={confirmacion.catalogoError}
              sinResultados={confirmacion.catalogoSinResultados}
              onReintentar={confirmacion.reintentarCatalogo}
            />
          </div>

          <BotonConfirmar
            puedeConfirmar={confirmacion.puedeConfirmar}
            pistaBloqueo={confirmacion.pistaBloqueo}
            enviando={confirmacion.enviando}
            errorEnvio={confirmacion.errorEnvio}
            onConfirmar={confirmacion.confirmar}
          />
        </main>

        <Pie />
      </div>
    </div>
  );
}

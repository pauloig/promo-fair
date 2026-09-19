import { useMemo, useState } from "react";
import { CATALOGO } from "../lib/catalogo";
import { calcularDescuentos } from "../lib/descuentos";
import { DATOS_VACIOS } from "../lib/datos";
import type { DatosCliente } from "../lib/datos";

export function useConfirmacion() {
  const [busqueda, setBusqueda] = useState("");
  const [seleccionados, setSeleccionados] = useState<ReadonlySet<string>>(new Set());
  const [datosCliente, setDatosCliente] = useState<DatosCliente>(DATOS_VACIOS);
  const [confirmada, setConfirmada] = useState(false);

  const filtrados = useMemo(
    () =>
      CATALOGO.filter((item) =>
        item.nombre.toLowerCase().includes(busqueda.trim().toLowerCase()),
      ),
    [busqueda],
  );

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

  function confirmar(): void {
    setConfirmada(true);
  }

  return {
    busqueda,
    setBusqueda,
    filtrados,
    seleccionados,
    alternarItem,
    resumen,
    datosCliente,
    cambiarDato,
    datosCompletos,
    puedeConfirmar,
    pistaBloqueo,
    confirmada,
    confirmar,
  };
}
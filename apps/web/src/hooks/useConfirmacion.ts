import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { obtenerCatalogo } from "../lib/api";
import { DATOS_VACIOS, type DatosCliente } from "../lib/datos";
import { calcularDescuentos } from "../lib/descuentos";

const DEBOUNCE_MS = 300;

function mensajeError(error: unknown): string {
  if (error instanceof TypeError) return "No se pudo conectar con la API.";
  return error instanceof Error
    ? error.message
    : "No se pudo consultar el catálogo.";
}

export function useConfirmacion() {
  const [busqueda, setBusqueda] = useState("");
  const [termino, setTermino] = useState("");
  const [seleccionados, setSeleccionados] = useState<ReadonlySet<string>>(
    new Set(),
  );
  const [datosCliente, setDatosCliente] = useState<DatosCliente>(DATOS_VACIOS);
  const [confirmada, setConfirmada] = useState(false);

  useEffect(() => {
    const temporizador = window.setTimeout(() => {
      setTermino(busqueda.trim());
    }, DEBOUNCE_MS);
    return () => window.clearTimeout(temporizador);
  }, [busqueda]);

  const catalogo = useQuery({
    queryKey: ["catalogo", "completo"],
    queryFn: () => obtenerCatalogo(""),
  });

  const resultados = useQuery({
    queryKey: ["catalogo", "buscar", termino],
    queryFn: () => obtenerCatalogo(termino),
    enabled: termino !== "",
    placeholderData: keepPreviousData,
  });

  const hayBusqueda = termino !== "";

  const filtrados = hayBusqueda
    ? (resultados.data ?? catalogo.data ?? [])
    : (catalogo.data ?? []);

  const errorActivo = hayBusqueda ? resultados.error : catalogo.error;
  const sinDatosActivos = hayBusqueda
    ? resultados.data === undefined
    : catalogo.data === undefined;

  const catalogoCargando =
    errorActivo === null &&
    sinDatosActivos &&
    (hayBusqueda ? resultados.isFetching : catalogo.isFetching);

  const catalogoError = errorActivo === null ? null : mensajeError(errorActivo);
  const catalogoSinResultados =
    !catalogoCargando && catalogoError === null && filtrados.length === 0;

  const resumen = useMemo(
    () =>
      calcularDescuentos(
        (catalogo.data ?? []).filter((item) => seleccionados.has(item.id)),
      ),
    [catalogo.data, seleccionados],
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

  function reintentarCatalogo(): void {
    const activa = hayBusqueda ? resultados : catalogo;
    void activa.refetch();
  }

  function confirmar(): void {
    setConfirmada(true);
  }

  return {
    busqueda,
    setBusqueda,
    filtrados,
    catalogoCargando,
    catalogoError,
    catalogoSinResultados,
    reintentarCatalogo,
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

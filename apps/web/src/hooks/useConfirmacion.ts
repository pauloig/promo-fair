import {
  ConfirmacionInputSchema,
  type ConfirmacionInput,
  type ConfirmacionPropia,
  type ConfirmacionResumen,
} from "@disagro/shared/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import type { Control, FieldErrors } from "react-hook-form";
import {
  enviarConfirmacion,
  obtenerCatalogo,
  obtenerMiConfirmacion,
  obtenerRangoFecha,
  type RangoFecha,
} from "../lib/api";
import { calcularDescuentos } from "../lib/descuentos";
import { formatoFechaLegible } from "../lib/fecha";

const DEBOUNCE_MS = 300;

const FORMULARIO_VACIO: ConfirmacionInput = {
  cliente: { nombre: "", apellidos: "", email: "" },
  fechaHoraEvento: "",
  itemIds: [],
};

function mensajeError(error: unknown): string {
  if (error instanceof TypeError) return "No se pudo conectar con la API.";
  return error instanceof Error
    ? error.message
    : "Ocurrió un error inesperado.";
}

function estaDentroDelRango(
  fechaHoraEvento: string,
  rango: RangoFecha,
): boolean {
  const momento = new Date(fechaHoraEvento).getTime();
  const inicio = new Date(rango.fechaInicio).getTime();
  const fin = new Date(rango.fechaFin).getTime();
  return momento >= inicio && momento <= fin;
}

export function useConfirmacion() {
  const queryClient = useQueryClient();
  const [busqueda, setBusqueda] = useState("");
  const [termino, setTermino] = useState("");
  const [seleccionados, setSeleccionados] = useState<ReadonlySet<string>>(
    new Set(),
  );
  const [confirmada, setConfirmada] = useState(false);
  const [editando, setEditando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null);
  const [resumenConfirmacion, setResumenConfirmacion] =
    useState<ConfirmacionResumen | null>(null);

  const form = useForm<ConfirmacionInput>({
    resolver: zodResolver(ConfirmacionInputSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: FORMULARIO_VACIO,
  });
  const { control, formState } = form;

  const miConfirmacion = useQuery({
    queryKey: ["confirmaciones", "mia"],
    queryFn: obtenerMiConfirmacion,
    staleTime: Infinity,
    retry: false,
  });

  const prellenado = useRef(false);

  useEffect(() => {
    const propios = miConfirmacion.data;
    if (propios === undefined || propios === null || prellenado.current) return;
    prellenado.current = true;
    form.reset({
      cliente: {
        nombre: propios.cliente.nombre,
        apellidos: propios.cliente.apellidos,
        email: propios.cliente.email,
      },
      fechaHoraEvento: propios.fechaHoraEvento,
      itemIds: propios.items.map((item) => item.catalogoItemId),
    });
    setSeleccionados(new Set(propios.items.map((item) => item.catalogoItemId)));
  }, [form, miConfirmacion.data]);

  useEffect(() => {
    const temporizador = window.setTimeout(() => {
      setTermino(busqueda.trim());
    }, DEBOUNCE_MS);
    return () => window.clearTimeout(temporizador);
  }, [busqueda]);

  useEffect(() => {
    form.setValue("itemIds", [...seleccionados]);
  }, [form, seleccionados]);

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

  const rangoQuery = useQuery({
    queryKey: ["evento", "rango-fecha"],
    queryFn: obtenerRangoFecha,
    staleTime: Infinity,
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

  const rango = rangoQuery.data ?? null;
  const rangoCargando = rangoQuery.isLoading;
  const rangoError =
    rangoQuery.error === null ? null : mensajeError(rangoQuery.error);

  const resumen = useMemo(
    () =>
      calcularDescuentos(
        (catalogo.data ?? []).filter((item) => seleccionados.has(item.id)),
      ),
    [catalogo.data, seleccionados],
  );

  const valores = form.watch();
  const nombre = valores.cliente?.nombre ?? "";
  const datosCompletos =
    nombre.trim() !== "" &&
    (valores.cliente?.apellidos ?? "").trim() !== "" &&
    (valores.cliente?.email ?? "").trim() !== "" &&
    (valores.fechaHoraEvento ?? "") !== "";

  const puedeConfirmar = datosCompletos && seleccionados.size > 0 && !enviando;
  const pistaBloqueo =
    seleccionados.size === 0
      ? "Seleccione al menos un servicio o producto para confirmar."
      : "Complete los campos del formulario para confirmar.";

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
    void form.handleSubmit(async (datos) => {
      if (rango !== null && !estaDentroDelRango(datos.fechaHoraEvento, rango)) {
        form.setError("fechaHoraEvento", {
          type: "fueraRango",
          message:
            `La fecha y hora seleccionada está fuera del rango del evento ` +
            `(entre el ${formatoFechaLegible(rango.fechaInicio)} y el ${formatoFechaLegible(rango.fechaFin)}).`,
        });
        return;
      }

      setEnviando(true);
      setErrorEnvio(null);
      try {
        const resumen = await enviarConfirmacion(datos);
        setResumenConfirmacion(resumen);
        setEditando(false);
        setConfirmada(true);
        await queryClient.invalidateQueries({
          queryKey: ["confirmaciones", "mia"],
        });
      } catch (error) {
        setErrorEnvio(mensajeError(error));
      } finally {
        setEnviando(false);
      }
    })();
  }

  function editar(): void {
    setEditando(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const recuperando = miConfirmacion.isLoading;

  const mostrarConfirmacion =
    (confirmada && resumenConfirmacion !== null) ||
    (!editando && miConfirmacion.data !== null);

  const resumenAMostrar: ConfirmacionResumen | null = confirmada
    ? resumenConfirmacion
    : (miConfirmacion.data ?? null);

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
    control: control as Control<ConfirmacionInput>,
    errores: formState.errors as FieldErrors<ConfirmacionInput>,
    rango,
    rangoCargando,
    rangoError,
    nombre,
    datosCompletos,
    puedeConfirmar,
    pistaBloqueo,
    confirmada,
    confirmar,
    enviando,
    errorEnvio,
    resumenConfirmacion,
    recuperando,
    mostrarConfirmacion,
    resumenAMostrar,
    editar,
  };
}

import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { VentasLoginInputSchema } from "@disagro/shared/schemas";
import type { VentasFiltros, VentasLoginInput } from "@disagro/shared/schemas";
import { useEffect, useState } from "react";
import {
  ApiError,
  exportarConfirmacionesVentas,
  iniciarSesionVentas,
  obtenerCatalogo,
  obtenerConfirmacionesVentas,
} from "../lib/api";
import { datetimeLocalAIso } from "../lib/fecha";

export type EstadoVentas = "comprobando" | "anonimo" | "autenticado" | "error";

export type FiltrosFormulario = {
  fechaDesde: string;
  fechaHasta: string;
  catalogoItemId: string;
};

export const FILTROS_VACIOS: FiltrosFormulario = {
  fechaDesde: "",
  fechaHasta: "",
  catalogoItemId: "",
};

function mensajeDeError(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "Ocurrió un error inesperado. Inténtelo de nuevo.";
}

function esNoAutorizado(error: unknown): error is ApiError {
  return error instanceof ApiError && error.status === 401;
}

export function useVentas() {
  const queryClient = useQueryClient();

  const sesionQuery = useQuery({
    queryKey: ["ventas", "sesion"],
    queryFn: () => obtenerConfirmacionesVentas({}),
    retry: false,
    staleTime: Infinity,
  });

  const estado: EstadoVentas =
    sesionQuery.error instanceof ApiError && sesionQuery.error.status === 401
      ? "anonimo"
      : sesionQuery.isPending
        ? "comprobando"
        : sesionQuery.error !== null
          ? "error"
          : "autenticado";

  const [filtrosFormulario, setFiltrosFormulario] =
    useState<FiltrosFormulario>(FILTROS_VACIOS);
  const [filtrosAplicados, setFiltrosAplicados] = useState<VentasFiltros>({});

  const listadoQuery = useQuery({
    queryKey: ["ventas", "confirmaciones", filtrosAplicados],
    queryFn: () => obtenerConfirmacionesVentas(filtrosAplicados),
    enabled: estado === "autenticado",
    retry: false,
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    if (esNoAutorizado(listadoQuery.error)) {
      void sesionQuery.refetch();
    }
  }, [sesionQuery, listadoQuery.error]);

  const catalogoQuery = useQuery({
    queryKey: ["catalogo", ""],
    queryFn: () => obtenerCatalogo(""),
    staleTime: Infinity,
    enabled: estado === "autenticado",
  });

  const {
    control,
    handleSubmit,
    formState: { errors: erroresLogin },
  } = useForm<VentasLoginInput>({
    resolver: zodResolver(VentasLoginInputSchema),
    mode: "onBlur",
    defaultValues: { username: "", password: "" },
  });
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginEnviando, setLoginEnviando] = useState(false);

  const iniciarSesion = handleSubmit(async (credenciales) => {
    setLoginEnviando(true);
    setLoginError(null);
    try {
      await iniciarSesionVentas(credenciales);
      await queryClient.invalidateQueries({ queryKey: ["ventas", "sesion"] });
    } catch (error) {
      setLoginError(mensajeDeError(error));
    } finally {
      setLoginEnviando(false);
    }
  });

  function aplicarFiltros(): void {
    setFiltrosAplicados({
      ...(filtrosFormulario.fechaDesde === ""
        ? {}
        : { fechaDesde: datetimeLocalAIso(filtrosFormulario.fechaDesde) }),
      ...(filtrosFormulario.fechaHasta === ""
        ? {}
        : { fechaHasta: datetimeLocalAIso(filtrosFormulario.fechaHasta) }),
      ...(filtrosFormulario.catalogoItemId === ""
        ? {}
        : { catalogoItemId: filtrosFormulario.catalogoItemId }),
    });
  }

  function limpiarFiltros(): void {
    setFiltrosFormulario(FILTROS_VACIOS);
    setFiltrosAplicados({});
  }

  const [exportando, setExportando] = useState(false);
  const [errorExport, setErrorExport] = useState<string | null>(null);

  async function exportarCsv(): Promise<void> {
    setExportando(true);
    setErrorExport(null);
    try {
      const blob = await exportarConfirmacionesVentas(filtrosAplicados);
      const url = URL.createObjectURL(blob);
      const enlace = document.createElement("a");
      enlace.href = url;
      enlace.download = "confirmaciones.csv";
      enlace.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      setErrorExport(mensajeDeError(error));
      if (esNoAutorizado(error)) {
        void sesionQuery.refetch();
      }
    } finally {
      setExportando(false);
    }
  }

  return {
    estado,
    sesionQuery,
    listadoQuery,
    catalogoQuery,
    reiniciarSesion: () => sesionQuery.refetch(),
    controlLogin: control,
    erroresLogin,
    iniciarSesion,
    loginEnviando,
    loginError,
    filtrosFormulario,
    setFiltrosFormulario,
    aplicarFiltros,
    limpiarFiltros,
    exportarCsv,
    exportando,
    errorExport,
  };
}

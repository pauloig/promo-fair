import type {
  ConfirmacionInput,
  ConfirmacionResumen,
  VentasConfirmacionesRespuesta,
  VentasFiltros,
  VentasLoginInput,
} from "@disagro/shared/schemas";
import type { CatalogoItem, TipoItem } from "./catalogo";

type CatalogoItemDto = {
  id: string;
  tipo: TipoItem;
  nombre: string;
  precioCentavos: number;
  activo: boolean;
};

export type RangoFecha = {
  fechaInicio: string;
  fechaFin: string;
};

const BASE_API = import.meta.env.VITE_API_URL ?? "/api";

export async function obtenerCatalogo(
  termino: string,
): Promise<CatalogoItem[]> {
  const url = new URL(`${BASE_API}/catalogo`, window.location.origin);
  const busqueda = termino.trim();
  if (busqueda !== "") {
    url.searchParams.set("buscar", busqueda);
  }

  const respuesta = await fetch(url, {
    headers: { Accept: "application/json" },
  });

  if (!respuesta.ok) {
    throw new Error(`El catálogo respondió con el estado ${respuesta.status}`);
  }

  const items = (await respuesta.json()) as CatalogoItemDto[];
  return items.map(({ id, tipo, nombre, precioCentavos }) => ({
    id,
    tipo,
    nombre,
    precioCentavos,
  }));
}

export async function obtenerRangoFecha(): Promise<RangoFecha> {
  const respuesta = await fetch(`${BASE_API}/evento/rango-fecha`, {
    headers: { Accept: "application/json" },
  });

  if (!respuesta.ok) {
    throw new Error(
      `El rango de fecha del evento respondió con el estado ${respuesta.status}`,
    );
  }

  return (await respuesta.json()) as RangoFecha;
}

export async function enviarConfirmacion(
  input: ConfirmacionInput,
): Promise<ConfirmacionResumen> {
  const respuesta = await fetch(`${BASE_API}/confirmaciones`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(input),
  });

  if (!respuesta.ok) {
    throw new Error(await mensajeDe(respuesta));
  }

  return (await respuesta.json()) as ConfirmacionResumen;
}

async function mensajeDe(respuesta: Response): Promise<string> {
  const cuerpo = await respuesta.json().catch(() => null);

  if (
    cuerpo !== null &&
    typeof cuerpo === "object" &&
    typeof (cuerpo as { message?: unknown }).message === "string"
  ) {
    return (cuerpo as { message: string }).message;
  }

  return `La API respondió con el estado ${respuesta.status}`;
}

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, mensaje: string) {
    super(mensaje);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function iniciarSesionVentas(
  input: VentasLoginInput,
): Promise<void> {
  const respuesta = await fetch(`${BASE_API}/ventas/login`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(input),
  });

  if (!respuesta.ok) {
    throw new ApiError(respuesta.status, await mensajeDe(respuesta));
  }
}

function conFiltrosVentas(base: string, filtros: VentasFiltros): URL {
  const url = new URL(base, window.location.origin);
  if (filtros.fechaDesde !== undefined) {
    url.searchParams.set("fechaDesde", filtros.fechaDesde);
  }
  if (filtros.fechaHasta !== undefined) {
    url.searchParams.set("fechaHasta", filtros.fechaHasta);
  }
  if (filtros.catalogoItemId !== undefined) {
    url.searchParams.set("catalogoItemId", filtros.catalogoItemId);
  }
  return url;
}

export async function obtenerConfirmacionesVentas(
  filtros: VentasFiltros,
): Promise<VentasConfirmacionesRespuesta> {
  const url = conFiltrosVentas(`${BASE_API}/ventas/confirmaciones`, filtros);
  const respuesta = await fetch(url, {
    credentials: "include",
    headers: { Accept: "application/json" },
  });

  if (!respuesta.ok) {
    throw new ApiError(respuesta.status, await mensajeDe(respuesta));
  }

  return (await respuesta.json()) as VentasConfirmacionesRespuesta;
}

export async function exportarConfirmacionesVentas(
  filtros: VentasFiltros,
): Promise<Blob> {
  const url = conFiltrosVentas(
    `${BASE_API}/ventas/confirmaciones/export`,
    filtros,
  );
  const respuesta = await fetch(url, { credentials: "include" });

  if (!respuesta.ok) {
    throw new ApiError(respuesta.status, await mensajeDe(respuesta));
  }

  return respuesta.blob();
}

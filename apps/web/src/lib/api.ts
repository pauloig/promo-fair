import type {
  ConfirmacionInput,
  ConfirmacionResumen,
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

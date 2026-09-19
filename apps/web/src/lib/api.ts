import type { CatalogoItem, TipoItem } from "./catalogo";

type CatalogoItemDto = {
  id: string;
  tipo: TipoItem;
  nombre: string;
  precioCentavos: number;
  activo: boolean;
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

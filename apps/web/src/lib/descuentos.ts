import type { CatalogoItem } from "./catalogo";

export const UMBRAL_SERVICIOS_CENTAVOS = 150000;

export type ResumenDescuentos = {
  servicios: ResumenCategoria;
  productos: ResumenCategoria;
  totalAntesCentavos: number;
  totalDespuesCentavos: number;
};

export type ResumenCategoria = {
  cantidad: number;
  subtotalCentavos: number;
  porcentaje: number;
  ahorroCentavos: number;
};

export function calcularDescuentos(seleccion: CatalogoItem[]): ResumenDescuentos {
  const servicios = seleccion.filter((item) => item.tipo === "SERVICIO");
  const productos = seleccion.filter((item) => item.tipo === "PRODUCTO");

  const subtotalServicios = sumaPrecisa(servicios);
  const subtotalProductos = sumaPrecisa(productos);

  const pctServicios = Math.max(
    servicios.length >= 2 ? 3 : 0,
    servicios.length >= 2 && subtotalServicios > UMBRAL_SERVICIOS_CENTAVOS ? 5 : 0,
  );
  const pctProductos = Math.max(
    productos.length >= 3 ? 3 : 0,
    productos.length >= 5 ? 5 : 0,
  );

  const ahorroServicios = Math.round((subtotalServicios * pctServicios) / 100);
  const ahorroProductos = Math.round((subtotalProductos * pctProductos) / 100);

  const totalAntesCentavos = subtotalServicios + subtotalProductos;
  const totalDespuesCentavos = totalAntesCentavos - ahorroServicios - ahorroProductos;

  return {
    servicios: {
      cantidad: servicios.length,
      subtotalCentavos: subtotalServicios,
      porcentaje: pctServicios,
      ahorroCentavos: ahorroServicios,
    },
    productos: {
      cantidad: productos.length,
      subtotalCentavos: subtotalProductos,
      porcentaje: pctProductos,
      ahorroCentavos: ahorroProductos,
    },
    totalAntesCentavos,
    totalDespuesCentavos,
  };
}

function sumaPrecisa(items: CatalogoItem[]): number {
  return items.reduce((acumulado, item) => acumulado + item.precioCentavos, 0);
}
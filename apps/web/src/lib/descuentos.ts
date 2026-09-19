import { calcularDescuentos as calcularPorcentajes } from "@disagro/shared/motor-descuentos";
import { UMBRAL_SERVICIOS_5_PCT_MONTO_CENTAVOS } from "@disagro/shared/constants";
import type { CatalogoItem } from "./catalogo";

export const UMBRAL_SERVICIOS_CENTAVOS = UMBRAL_SERVICIOS_5_PCT_MONTO_CENTAVOS;

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

export function calcularDescuentos(
  seleccion: CatalogoItem[],
): ResumenDescuentos {
  const servicios = seleccion.filter((item) => item.tipo === "SERVICIO");
  const productos = seleccion.filter((item) => item.tipo === "PRODUCTO");

  const subtotalServicios = sumaPrecios(servicios);
  const subtotalProductos = sumaPrecios(productos);

  const { descuentoServiciosPct, descuentoProductosPct } = calcularPorcentajes(
    seleccion.map(({ tipo, precioCentavos }) => ({ tipo, precioCentavos })),
  );

  const ahorroServicios = Math.round(
    (subtotalServicios * descuentoServiciosPct) / 100,
  );
  const ahorroProductos = Math.round(
    (subtotalProductos * descuentoProductosPct) / 100,
  );

  const totalAntesCentavos = subtotalServicios + subtotalProductos;
  const totalDespuesCentavos =
    totalAntesCentavos - ahorroServicios - ahorroProductos;

  return {
    servicios: {
      cantidad: servicios.length,
      subtotalCentavos: subtotalServicios,
      porcentaje: descuentoServiciosPct,
      ahorroCentavos: ahorroServicios,
    },
    productos: {
      cantidad: productos.length,
      subtotalCentavos: subtotalProductos,
      porcentaje: descuentoProductosPct,
      ahorroCentavos: ahorroProductos,
    },
    totalAntesCentavos,
    totalDespuesCentavos,
  };
}

function sumaPrecios(items: CatalogoItem[]): number {
  return items.reduce((acumulado, item) => acumulado + item.precioCentavos, 0);
}

import {
  UMBRAL_PRODUCTOS_3_PCT,
  UMBRAL_PRODUCTOS_5_PCT,
  UMBRAL_SERVICIOS_3_PCT,
  UMBRAL_SERVICIOS_5_PCT_MONTO_CENTAVOS,
} from "./constants.js";
import type { TipoItem } from "./schemas.js";

const DESCUENTO_3_PCT = 3;
const DESCUENTO_5_PCT = 5;

export interface ItemPrecioCentavos {
  tipo: TipoItem;
  precioCentavos: number;
}

export function calcularDescuentos(
  items: ItemPrecioCentavos[],
): { descuentoServiciosPct: number; descuentoProductosPct: number } {
  const servicios = items.filter((item) => item.tipo === "SERVICIO");
  const productos = items.filter((item) => item.tipo === "PRODUCTO");

  const sumaServiciosCentavos = servicios.reduce(
    (suma, item) => suma + item.precioCentavos,
    0,
  );

  let descuentoServiciosPct = 0;
  if (servicios.length >= UMBRAL_SERVICIOS_3_PCT) {
    descuentoServiciosPct =
      sumaServiciosCentavos > UMBRAL_SERVICIOS_5_PCT_MONTO_CENTAVOS
        ? DESCUENTO_5_PCT
        : DESCUENTO_3_PCT;
  }

  let descuentoProductosPct = 0;
  if (productos.length >= UMBRAL_PRODUCTOS_5_PCT) {
    descuentoProductosPct = DESCUENTO_5_PCT;
  } else if (productos.length >= UMBRAL_PRODUCTOS_3_PCT) {
    descuentoProductosPct = DESCUENTO_3_PCT;
  }

  return { descuentoServiciosPct, descuentoProductosPct };
}
import type { ConfirmacionResumen, TipoItem } from "@disagro/shared";

export interface ConfirmacionItemPersistido {
  id: string;
  tipo: TipoItem;
  nombreCongelado: string;
  precioCongeladoCentavos: number;
}

export interface ConfirmacionConItems {
  id: string;
  clienteId: string;
  descuentoServiciosPct: number;
  descuentoProductosPct: number;
  items: ConfirmacionItemPersistido[];
}

export function toConfirmacionResumen(
  confirmacion: ConfirmacionConItems,
): ConfirmacionResumen {
  return {
    id: confirmacion.id,
    items: confirmacion.items.map((item) => ({
      id: item.id,
      tipo: item.tipo,
      nombreCongelado: item.nombreCongelado,
      precioCongeladoCentavos: item.precioCongeladoCentavos,
    })),
    descuentoServiciosPct: confirmacion.descuentoServiciosPct,
    descuentoProductosPct: confirmacion.descuentoProductosPct,
  };
}
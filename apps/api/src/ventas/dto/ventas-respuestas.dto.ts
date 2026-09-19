import type { TipoItem } from "@disagro/shared";
import type { Confirmacion, ConfirmacionItem } from "@prisma/client";

export interface VentasItemFila {
  catalogoItemId: string;
  tipo: TipoItem;
  nombreCongelado: string;
  precioCongeladoCentavos: number;
}

export interface VentasConfirmacionFila {
  id: string;
  fechaHoraEvento: string;
  cliente: { nombre: string; apellidos: string; email: string };
  descuentoServiciosPct: number;
  descuentoProductosPct: number;
  items: VentasItemFila[];
}

export interface VentasTopItem {
  catalogoItemId: string;
  nombre: string;
  tipo: TipoItem;
  cantidad: number;
}

export interface VentasResumen {
  totalConfirmaciones: number;
  topItems: VentasTopItem[];
}

export interface VentasConfirmacionesRespuesta {
  confirmaciones: VentasConfirmacionFila[];
  resumen: VentasResumen;
}

export interface ConfirmacionConClienteYItems extends Confirmacion {
  cliente: { nombre: string; apellidos: string; email: string };
  items: ConfirmacionItem[];
}

export function toVentasConfirmacionFila(
  confirmacion: ConfirmacionConClienteYItems,
): VentasConfirmacionFila {
  return {
    id: confirmacion.id,
    fechaHoraEvento: confirmacion.fechaHoraEvento.toISOString(),
    cliente: {
      nombre: confirmacion.cliente.nombre,
      apellidos: confirmacion.cliente.apellidos,
      email: confirmacion.cliente.email,
    },
    descuentoServiciosPct: confirmacion.descuentoServiciosPct,
    descuentoProductosPct: confirmacion.descuentoProductosPct,
    items: confirmacion.items.map((item) => ({
      catalogoItemId: item.catalogoItemId,
      tipo: item.tipo,
      nombreCongelado: item.nombreCongelado,
      precioCongeladoCentavos: item.precioCongeladoCentavos,
    })),
  };
}

export function construirResumen(
  confirmaciones: ConfirmacionConClienteYItems[],
): VentasResumen {
  const conteo = new Map<string, VentasTopItem>();

  for (const confirmacion of confirmaciones) {
    for (const item of confirmacion.items) {
      const actual = conteo.get(item.catalogoItemId) ?? {
        catalogoItemId: item.catalogoItemId,
        nombre: item.nombreCongelado,
        tipo: item.tipo,
        cantidad: 0,
      };
      actual.cantidad += 1;
      conteo.set(item.catalogoItemId, actual);
    }
  }

  const topItems = [...conteo.values()]
    .sort(
      (a, b) => b.cantidad - a.cantidad || a.nombre.localeCompare(b.nombre, "es"),
    )
    .slice(0, 5);

  return { totalConfirmaciones: confirmaciones.length, topItems };
}

function escaparCsv(valor: string | number): string {
  const texto = String(valor);
  if (/[",\n\r]/.test(texto)) {
    return `"${texto.replaceAll('"', '""')}"`;
  }
  return texto;
}

export function construirCsv(confirmaciones: ConfirmacionConClienteYItems[]): string {
  const cabecera = "id,fechaHoraEvento,clienteEmail,clienteNombre,clienteApellidos," +
    "descuentoServiciosPct,descuentoProductosPct,items";

  const filas = confirmaciones.map((confirmacion) => {
    const nombresItems = confirmacion.items
      .map((item) => item.nombreCongelado)
      .join(", ");
    return [
      escaparCsv(confirmacion.id),
      escaparCsv(confirmacion.fechaHoraEvento.toISOString()),
      escaparCsv(confirmacion.cliente.email),
      escaparCsv(confirmacion.cliente.nombre),
      escaparCsv(confirmacion.cliente.apellidos),
      escaparCsv(confirmacion.descuentoServiciosPct),
      escaparCsv(confirmacion.descuentoProductosPct),
      escaparCsv(nombresItems),
    ].join(",");
  });

  return `\uFEFF${cabecera}\n${filas.join("\n")}`;
}
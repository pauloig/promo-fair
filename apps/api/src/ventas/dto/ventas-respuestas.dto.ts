import { ApiProperty } from "@nestjs/swagger";
import type { TipoItem } from "@disagro/shared";
import type { Confirmacion, ConfirmacionItem } from "@prisma/client";

export class VentasItemFila {
  @ApiProperty({
    description: "Identificador del ítem en el catálogo (UUID).",
    format: "uuid",
  })
  readonly catalogoItemId!: string;

  @ApiProperty({
    description: "Categoría del ítem.",
    enum: ["SERVICIO", "PRODUCTO"],
  })
  readonly tipo!: TipoItem;

  @ApiProperty({
    description: "Nombre del ítem congelado al confirmar (ADR-007).",
    example: "Urea granulada",
  })
  readonly nombreCongelado!: string;

  @ApiProperty({
    description: "Precio congelado del ítem en centavos (ADR-007).",
    example: 34000,
    minimum: 0,
  })
  readonly precioCongeladoCentavos!: number;
}

export class VentasClienteFila {
  @ApiProperty({
    description: "Nombre(s) del cliente.",
    example: "José",
  })
  readonly nombre!: string;

  @ApiProperty({
    description: "Apellido(s) del cliente.",
    example: "Pérez López",
  })
  readonly apellidos!: string;

  @ApiProperty({
    description: "Correo electrónico del cliente.",
    format: "email",
    example: "cliente@example.com",
  })
  readonly email!: string;
}

export class VentasConfirmacionFila {
  @ApiProperty({
    description: "Identificador de la confirmación (UUID).",
    format: "uuid",
  })
  readonly id!: string;

  @ApiProperty({
    description: "Fecha y hora del evento seleccionada por el cliente (ISO 8601).",
    format: "date-time",
  })
  readonly fechaHoraEvento!: string;

  @ApiProperty({
    description: "Datos del cliente que realizó la confirmación.",
    type: VentasClienteFila,
  })
  readonly cliente!: VentasClienteFila;

  @ApiProperty({
    description: "Porcentaje de descuento aplicado sobre el subtotal de Servicios.",
    example: 5,
    minimum: 0,
  })
  readonly descuentoServiciosPct!: number;

  @ApiProperty({
    description: "Porcentaje de descuento aplicado sobre el subtotal de Productos.",
    example: 5,
    minimum: 0,
  })
  readonly descuentoProductosPct!: number;

  @ApiProperty({
    description: "Ítems seleccionados con su nombre y precio congelados.",
    type: VentasItemFila,
    isArray: true,
  })
  readonly items!: VentasItemFila[];
}

export class VentasTopItem {
  @ApiProperty({
    description: "Identificador del ítem en el catálogo (UUID).",
    format: "uuid",
  })
  readonly catalogoItemId!: string;

  @ApiProperty({
    description: "Nombre del ítem.",
    example: "Urea granulada",
  })
  readonly nombre!: string;

  @ApiProperty({
    description: "Categoría del ítem.",
    enum: ["SERVICIO", "PRODUCTO"],
  })
  readonly tipo!: TipoItem;

  @ApiProperty({
    description: "Cantidad de confirmaciones que incluyen el ítem.",
    example: 4,
    minimum: 0,
  })
  readonly cantidad!: number;
}

export class VentasResumen {
  @ApiProperty({
    description: "Número total de confirmaciones que cumplen los filtros.",
    example: 4,
    minimum: 0,
  })
  readonly totalConfirmaciones!: number;

  @ApiProperty({
    description: "Los 5 ítems más solicitados (por cantidad, desempatando por nombre).",
    type: VentasTopItem,
    isArray: true,
  })
  readonly topItems!: VentasTopItem[];
}

export class VentasConfirmacionesRespuesta {
  @ApiProperty({
    description: "Confirmaciones que cumplen los filtros, ordenadas por fecha del evento.",
    type: VentasConfirmacionFila,
    isArray: true,
  })
  readonly confirmaciones!: VentasConfirmacionFila[];

  @ApiProperty({
    description: "Resumen agregado (total y top 5 de ítems).",
    type: VentasResumen,
  })
  readonly resumen!: VentasResumen;
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
  interface ConteoItem {
    catalogoItemId: string;
    nombre: string;
    tipo: TipoItem;
    cantidad: number;
  }

  const conteo = new Map<string, ConteoItem>();

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
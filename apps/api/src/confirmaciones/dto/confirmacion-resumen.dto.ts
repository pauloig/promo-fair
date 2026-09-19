import { ApiProperty } from "@nestjs/swagger";
import type { TipoItem } from "@disagro/shared";

export class ConfirmacionItemPersistido {
  @ApiProperty({
    description: "Identificador único del ítem de la confirmación (UUID).",
    format: "uuid",
  })
  readonly id!: string;

  @ApiProperty({
    description: "Categoría del ítem congelada al confirmar.",
    enum: ["SERVICIO", "PRODUCTO"],
  })
  readonly tipo!: TipoItem;

  @ApiProperty({
    description: "Nombre del ítem congelado al momento de confirmar (ADR-007).",
    example: "Urea granulada",
  })
  readonly nombreCongelado!: string;

  @ApiProperty({
    description: "Precio del ítem en centavos, congelado al momento de confirmar (ADR-007).",
    example: 34000,
    minimum: 0,
  })
  readonly precioCongeladoCentavos!: number;
}

export interface ConfirmacionConItems {
  id: string;
  clienteId: string;
  descuentoServiciosPct: number;
  descuentoProductosPct: number;
  items: ConfirmacionItemPersistido[];
}

export class ConfirmacionResumenDto {
  @ApiProperty({
    description: "Identificador de la confirmación (UUID).",
    format: "uuid",
  })
  readonly id!: string;

  @ApiProperty({
    description: "Ítems seleccionados con su nombre y precio congelados.",
    type: () => ConfirmacionItemPersistido,
    isArray: true,
  })
  readonly items!: ConfirmacionItemPersistido[];

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
}

export function toConfirmacionResumen(
  confirmacion: ConfirmacionConItems,
): ConfirmacionResumenDto {
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

export class ConfirmacionPropia {
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
    type: () => ConfirmacionItemPersistido,
    isArray: true,
  })
  readonly items!: ConfirmacionItemPersistido[];
}

export function toConfirmacionPropia(
  confirmacion: ConfirmacionConItems & { fechaHoraEvento: Date },
): ConfirmacionPropia {
  return {
    id: confirmacion.id,
    fechaHoraEvento: confirmacion.fechaHoraEvento.toISOString(),
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
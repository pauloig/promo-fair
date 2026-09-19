import { ApiProperty } from "@nestjs/swagger";

export type TipoItemDto = "SERVICIO" | "PRODUCTO";

export class CatalogoItemDto {
  @ApiProperty({
    description: "Identificador único del ítem (UUID).",
    format: "uuid",
  })
  readonly id!: string;

  @ApiProperty({
    description: "Categoría del ítem: servicio o producto.",
    enum: ["SERVICIO", "PRODUCTO"],
    example: "SERVICIO",
  })
  readonly tipo!: TipoItemDto;

  @ApiProperty({
    description: "Nombre comercial del ítem.",
    example: "Servicio control de plagas",
  })
  readonly nombre!: string;

  @ApiProperty({
    description: "Precio vigente del ítem en centavos (moneda GTQ).",
    example: 100000,
    minimum: 0,
  })
  readonly precioCentavos!: number;

  @ApiProperty({
    description: "Indica si el ítem está disponible para selección.",
    example: true,
  })
  readonly activo!: boolean;
}

export interface CatalogoItemRow {
  id: string;
  tipo: TipoItemDto;
  nombre: string;
  precioActualCentavos: number;
  activo: boolean;
}

export function toCatalogoItemDto(item: CatalogoItemRow): CatalogoItemDto {
  return {
    id: item.id,
    tipo: item.tipo,
    nombre: item.nombre,
    precioCentavos: item.precioActualCentavos,
    activo: item.activo,
  };
}
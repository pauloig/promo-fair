export type TipoItemDto = "SERVICIO" | "PRODUCTO";

export interface CatalogoItemDto {
  id: string;
  tipo: TipoItemDto;
  nombre: string;
  precioCentavos: number;
  activo: boolean;
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
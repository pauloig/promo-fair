export type TipoItem = "SERVICIO" | "PRODUCTO";

export type CatalogoItem = {
  id: string;
  tipo: TipoItem;
  nombre: string;
  precioCentavos: number;
};

export const ETIQUETA_TIPO: Record<TipoItem, string> = {
  SERVICIO: "Servicio",
  PRODUCTO: "Producto",
};

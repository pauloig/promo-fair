export type TipoItem = "SERVICIO" | "PRODUCTO";

export type CatalogoItem = {
  id: string;
  tipo: TipoItem;
  nombre: string;
  precioCentavos: number;
};

export const CATALOGO: CatalogoItem[] = [
  // Servicios
  { id: "srv-riego", tipo: "SERVICIO", nombre: "Instalación de riego por goteo", precioCentavos: 185000 },
  { id: "srv-suelo", tipo: "SERVICIO", nombre: "Análisis de suelo", precioCentavos: 65000 },
  { id: "srv-asesoria", tipo: "SERVICIO", nombre: "Asesoría técnica en campo", precioCentavos: 90000 },
  { id: "srv-fumigacion", tipo: "SERVICIO", nombre: "Aplicación de fumigación", precioCentavos: 120000 },
  { id: "srv-calibracion", tipo: "SERVICIO", nombre: "Calibración de equipo de aspersión", precioCentavos: 40000 },

  // Productos
  { id: "pro-fertilizante", tipo: "PRODUCTO", nombre: "Fertilizante foliar completo 20 L", precioCentavos: 52000 },
  { id: "pro-semilla", tipo: "PRODUCTO", nombre: "Semilla híbrida de maíz (saco 50 lb)", precioCentavos: 89000 },
  { id: "pro-herbicida", tipo: "PRODUCTO", nombre: "Herbicida selectivo 1 L", precioCentavos: 31000 },
  { id: "pro-insecticida", tipo: "PRODUCTO", nombre: "Insecticida biológico 1 L", precioCentavos: 27500 },
  { id: "pro-fungicida", tipo: "PRODUCTO", nombre: "Fungicida cúprico 1 kg", precioCentavos: 24000 },
  { id: "pro-bioestimulante", tipo: "PRODUCTO", nombre: "Bioestimulante de raíces 5 L", precioCentavos: 46000 },
];

export const ETIQUETA_TIPO: Record<TipoItem, string> = {
  SERVICIO: "Servicio",
  PRODUCTO: "Producto",
};
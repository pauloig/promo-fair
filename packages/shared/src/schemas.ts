import { z } from "zod";

export const TipoItemSchema = z.enum(["SERVICIO", "PRODUCTO"]);

export const ClienteSchema = z.object({
  nombre: z.string().trim().min(1),
  apellidos: z.string().trim().min(1),
  email: z.email().trim(),
});

export const CatalogoItemSchema = z.object({
  id: z.uuid(),
  tipo: TipoItemSchema,
  nombre: z.string().trim().min(1),
  precioCentavos: z.number().int().min(0),
  activo: z.boolean(),
});

export const ConfirmacionInputSchema = z.object({
  cliente: ClienteSchema,
  fechaHoraEvento: z.iso.datetime({ offset: true }),
  itemIds: z.array(z.uuid()).min(1),
});

export const ConfirmacionItemResumenSchema = z.object({
  id: z.uuid(),
  tipo: TipoItemSchema,
  nombreCongelado: z.string().trim().min(1),
  precioCongeladoCentavos: z.number().int().min(0),
});

export const ConfirmacionResumenSchema = z.object({
  id: z.uuid(),
  items: z.array(ConfirmacionItemResumenSchema),
  descuentoServiciosPct: z.number().int().min(0),
  descuentoProductosPct: z.number().int().min(0),
});

export const VentasLoginInputSchema = z.object({
  username: z.string().trim().min(1),
  password: z.string().min(1),
});

export const VentasFiltrosSchema = z.object({
  fechaDesde: z.iso.datetime({ offset: true }).optional(),
  fechaHasta: z.iso.datetime({ offset: true }).optional(),
  catalogoItemId: z.uuid().optional(),
});

export const VentasItemFilaSchema = z.object({
  catalogoItemId: z.uuid(),
  tipo: TipoItemSchema,
  nombreCongelado: z.string().trim().min(1),
  precioCongeladoCentavos: z.number().int().min(0),
});

export const VentasClienteFilaSchema = z.object({
  nombre: z.string().trim().min(1),
  apellidos: z.string().trim().min(1),
  email: z.email().trim(),
});

export const VentasConfirmacionFilaSchema = z.object({
  id: z.uuid(),
  fechaHoraEvento: z.iso.datetime({ offset: true }),
  cliente: VentasClienteFilaSchema,
  descuentoServiciosPct: z.number().int().min(0),
  descuentoProductosPct: z.number().int().min(0),
  items: z.array(VentasItemFilaSchema),
});

export const VentasTopItemSchema = z.object({
  catalogoItemId: z.uuid(),
  nombre: z.string().trim().min(1),
  tipo: TipoItemSchema,
  cantidad: z.number().int().min(0),
});

export const VentasResumenSchema = z.object({
  totalConfirmaciones: z.number().int().min(0),
  topItems: z.array(VentasTopItemSchema),
});

export const VentasConfirmacionesRespuestaSchema = z.object({
  confirmaciones: z.array(VentasConfirmacionFilaSchema),
  resumen: VentasResumenSchema,
});

export type TipoItem = z.infer<typeof TipoItemSchema>;
export type Cliente = z.infer<typeof ClienteSchema>;
export type CatalogoItem = z.infer<typeof CatalogoItemSchema>;
export type ConfirmacionInput = z.infer<typeof ConfirmacionInputSchema>;
export type ConfirmacionItemResumen = z.infer<
  typeof ConfirmacionItemResumenSchema
>;
export type ConfirmacionResumen = z.infer<typeof ConfirmacionResumenSchema>;
export type VentasLoginInput = z.infer<typeof VentasLoginInputSchema>;
export type VentasFiltros = z.infer<typeof VentasFiltrosSchema>;
export type VentasItemFila = z.infer<typeof VentasItemFilaSchema>;
export type VentasConfirmacionFila = z.infer<
  typeof VentasConfirmacionFilaSchema
>;
export type VentasTopItem = z.infer<typeof VentasTopItemSchema>;
export type VentasResumen = z.infer<typeof VentasResumenSchema>;
export type VentasConfirmacionesRespuesta = z.infer<
  typeof VentasConfirmacionesRespuestaSchema
>;

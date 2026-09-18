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

export type TipoItem = z.infer<typeof TipoItemSchema>;
export type Cliente = z.infer<typeof ClienteSchema>;
export type CatalogoItem = z.infer<typeof CatalogoItemSchema>;
export type ConfirmacionInput = z.infer<typeof ConfirmacionInputSchema>;
export type ConfirmacionItemResumen = z.infer<typeof ConfirmacionItemResumenSchema>;
export type ConfirmacionResumen = z.infer<typeof ConfirmacionResumenSchema>;
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type { ConfigType } from "@nestjs/config";
import jwt from "jsonwebtoken";
import {
  calcularDescuentos,
  type ConfirmacionInput,
  type ConfirmacionResumen,
} from "@disagro/shared";
import { EventoService } from "../evento/evento.service.js";
import { PrismaService } from "../prisma/prisma.service.js";
import {
  toConfirmacionPropia,
  toConfirmacionResumen,
  type ConfirmacionConItems,
  type ConfirmacionPropia,
} from "./dto/confirmacion-resumen.dto.js";
import jwtConfig from "./jwt.config.js";

@Injectable()
export class ConfirmacionesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventoService: EventoService,
    @Inject(jwtConfig.KEY)
    private readonly jwt: Readonly<ConfigType<typeof jwtConfig>>,
  ) {}

  async confirmar(
    input: ConfirmacionInput,
  ): Promise<{ token: string; resumen: ConfirmacionResumen }> {
    this.validarRangoDeFechaHora(input.fechaHoraEvento);

    return this.prisma.$transaction(async (tx) => {
      const itemIdsUnicos = [...new Set(input.itemIds)];

      const itemsCatalogo = await tx.catalogoItem.findMany({
        where: { id: { in: itemIdsUnicos }, activo: true },
      });

      const catalogoPorId = new Map(itemsCatalogo.map((item) => [item.id, item]));
      const faltantes = itemIdsUnicos.filter((id) => !catalogoPorId.has(id));

      if (faltantes.length > 0) {
        throw new BadRequestException(
          `Ítems no encontrados o inactivos en el catálogo: ${faltantes.join(", ")}`,
        );
      }

      const itemsSeleccionados = itemIdsUnicos.map((id) => catalogoPorId.get(id)!);

      const descuentos = calcularDescuentos(
        itemsSeleccionados.map((item) => ({
          tipo: item.tipo,
          precioCentavos: item.precioActualCentavos,
        })),
      );

      const datosItems = itemsSeleccionados.map((item) => ({
        catalogoItemId: item.id,
        tipo: item.tipo,
        nombreCongelado: item.nombre,
        precioCongeladoCentavos: item.precioActualCentavos,
      }));

      const cliente = await tx.cliente.findUnique({
        where: { email: input.cliente.email },
        include: { confirmacion: { include: { items: true } } },
      });

      let confirmacion: ConfirmacionConItems;

      if (cliente?.confirmacion) {
        const previa = cliente.confirmacion;

        await tx.confirmacionHistorial.create({
          data: {
            confirmacionId: previa.id,
            estadoAnterior: {
              fechaHoraEvento: previa.fechaHoraEvento.toISOString(),
              descuentoServiciosPct: previa.descuentoServiciosPct,
              descuentoProductosPct: previa.descuentoProductosPct,
              items: previa.items.map((item) => ({
                id: item.id,
                catalogoItemId: item.catalogoItemId,
                tipo: item.tipo,
                nombreCongelado: item.nombreCongelado,
                precioCongeladoCentavos: item.precioCongeladoCentavos,
              })),
            },
          },
        });

        confirmacion = await tx.confirmacion.update({
          where: { id: previa.id },
          data: {
            fechaHoraEvento: new Date(input.fechaHoraEvento),
            descuentoServiciosPct: descuentos.descuentoServiciosPct,
            descuentoProductosPct: descuentos.descuentoProductosPct,
            items: { deleteMany: {}, create: datosItems },
          },
          include: { items: true },
        });
      } else {
        let clienteId: string;

        if (cliente) {
          clienteId = cliente.id;
        } else {
          const nuevoCliente = await tx.cliente.create({
            data: {
              nombre: input.cliente.nombre,
              apellidos: input.cliente.apellidos,
              email: input.cliente.email,
            },
          });
          clienteId = nuevoCliente.id;
        }

        confirmacion = await tx.confirmacion.create({
          data: {
            clienteId,
            fechaHoraEvento: new Date(input.fechaHoraEvento),
            descuentoServiciosPct: descuentos.descuentoServiciosPct,
            descuentoProductosPct: descuentos.descuentoProductosPct,
            items: { create: datosItems },
          },
          include: { items: true },
        });
      }

      const token = jwt.sign(
        { sub: confirmacion.clienteId },
        this.jwt.secret,
        { expiresIn: `${this.jwt.expiracionDias}d` },
      );

      return { resumen: toConfirmacionResumen(confirmacion), token };
    });
  }

  async mia(clienteId: string): Promise<ConfirmacionPropia> {
    const confirmacion = await this.prisma.confirmacion.findUnique({
      where: { clienteId },
      include: { items: true },
    });

    if (!confirmacion) {
      throw new NotFoundException(
        "No hay una confirmación registrada para este cliente",
      );
    }

    return toConfirmacionPropia(confirmacion);
  }

  private validarRangoDeFechaHora(fechaHoraEvento: string): void {
    const rango = this.eventoService.rangoFecha();
    const momento = new Date(fechaHoraEvento).getTime();
    const inicio = new Date(rango.fechaInicio).getTime();
    const fin = new Date(rango.fechaFin).getTime();

    if (momento < inicio || momento > fin) {
      throw new BadRequestException(
        `La fecha y hora seleccionada (${fechaHoraEvento}) está fuera del rango habilitado del evento (${rango.fechaInicio} a ${rango.fechaFin})`,
      );
    }
  }
}
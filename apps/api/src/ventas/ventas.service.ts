import {
  BadRequestException,
  Inject,
  Injectable,
  OnModuleInit,
  UnauthorizedException,
} from "@nestjs/common";
import type { ConfigType } from "@nestjs/config";
import type { Prisma } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import type { VentasFiltros, VentasLoginInput } from "@disagro/shared";
import jwtConfig from "../confirmaciones/jwt.config.js";
import { PrismaService } from "../prisma/prisma.service.js";
import {
  construirCsv,
  construirResumen,
  toVentasConfirmacionFila,
  type ConfirmacionConClienteYItems,
  type VentasConfirmacionesRespuesta,
} from "./dto/ventas-respuestas.dto.js";
import { ROL_VENTAS } from "./ventas.constants.js";
import ventasConfig from "./ventas.config.js";

@Injectable()
export class VentasService implements OnModuleInit {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(jwtConfig.KEY)
    private readonly jwt: Readonly<ConfigType<typeof jwtConfig>>,
    @Inject(ventasConfig.KEY)
    private readonly ventas: Readonly<ConfigType<typeof ventasConfig>>,
  ) {}

  async onModuleInit(): Promise<void> {
    const passwordHash = await bcrypt.hash(this.ventas.password, 10);
    await this.prisma.usuarioVentas.upsert({
      where: { username: this.ventas.usuario },
      update: { passwordHash },
      create: { username: this.ventas.usuario, passwordHash },
    });
  }

  async login(input: VentasLoginInput): Promise<string> {
    const usuario = await this.prisma.usuarioVentas.findUnique({
      where: { username: input.username },
    });

    const passwordCorrecta =
      usuario !== null && (await bcrypt.compare(input.password, usuario.passwordHash));

    if (!passwordCorrecta) {
      throw new UnauthorizedException("Credenciales de Ventas inválidas");
    }

    return jwt.sign({ aud: ROL_VENTAS }, this.jwt.secret, {
      expiresIn: `${this.ventas.expiracionHoras}h`,
    });
  }

  async listarConfirmaciones(filtros: VentasFiltros): Promise<VentasConfirmacionesRespuesta> {
    this.validarFiltros(filtros);

    const confirmaciones = await this.consultarConfirmaciones(filtros);

    return {
      confirmaciones: confirmaciones.map(toVentasConfirmacionFila),
      resumen: construirResumen(confirmaciones),
    };
  }

  async exportarCsv(filtros: VentasFiltros): Promise<string> {
    this.validarFiltros(filtros);

    const confirmaciones = await this.consultarConfirmaciones(filtros);

    return construirCsv(confirmaciones);
  }

  private async consultarConfirmaciones(
    filtros: VentasFiltros,
  ): Promise<ConfirmacionConClienteYItems[]> {
    return this.prisma.confirmacion.findMany({
      where: this.construirWhere(filtros),
      include: { cliente: true, items: true },
      orderBy: { fechaHoraEvento: "asc" },
    });
  }

  private construirWhere(filtros: VentasFiltros): Prisma.ConfirmacionWhereInput {
    const where: Prisma.ConfirmacionWhereInput = {};

    if (filtros.fechaDesde !== undefined || filtros.fechaHasta !== undefined) {
      where.fechaHoraEvento = {};
      if (filtros.fechaDesde !== undefined) {
        where.fechaHoraEvento.gte = new Date(filtros.fechaDesde);
      }
      if (filtros.fechaHasta !== undefined) {
        where.fechaHoraEvento.lte = new Date(filtros.fechaHasta);
      }
    }

    if (filtros.catalogoItemId !== undefined) {
      where.items = { some: { catalogoItemId: filtros.catalogoItemId } };
    }

    return where;
  }

  private validarFiltros(filtros: VentasFiltros): void {
    if (
      filtros.fechaDesde !== undefined &&
      filtros.fechaHasta !== undefined &&
      new Date(filtros.fechaDesde).getTime() > new Date(filtros.fechaHasta).getTime()
    ) {
      throw new BadRequestException(
        "El parámetro fechaDesde no puede ser posterior a fechaHasta",
      );
    }
  }
}
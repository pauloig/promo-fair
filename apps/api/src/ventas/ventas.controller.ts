import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  Query,
  Res,
  UseGuards,
} from "@nestjs/common";
import type { ConfigType } from "@nestjs/config";
import type { Response } from "express";
import type { VentasFiltros, VentasLoginInput } from "@disagro/shared";
import { VentasFiltrosSchema, VentasLoginInputSchema } from "@disagro/shared";
import { ZodValidationPipe } from "../common/zod-validation.pipe.js";
import jwtConfig from "../confirmaciones/jwt.config.js";
import type { VentasConfirmacionesRespuesta } from "./dto/ventas-respuestas.dto.js";
import { COOKIE_VENTAS } from "./ventas.constants.js";
import { VentasLoginGuard } from "./ventas-login.guard.js";
import { VentasService } from "./ventas.service.js";
import ventasConfig from "./ventas.config.js";

@Controller("ventas")
export class VentasController {
  constructor(
    private readonly ventasService: VentasService,
    @Inject(jwtConfig.KEY)
    private readonly jwt: Readonly<ConfigType<typeof jwtConfig>>,
    @Inject(ventasConfig.KEY)
    private readonly ventas: Readonly<ConfigType<typeof ventasConfig>>,
  ) {}

  @Post("login")
  @HttpCode(HttpStatus.OK)
  async login(
    @Body(new ZodValidationPipe(VentasLoginInputSchema)) credenciales: VentasLoginInput,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ ok: boolean }> {
    const token = await this.ventasService.login(credenciales);

    res.cookie(COOKIE_VENTAS, token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: this.ventas.expiracionHoras * 60 * 60 * 1000,
      path: "/",
    });

    return { ok: true };
  }

  @Get("confirmaciones")
  @UseGuards(VentasLoginGuard)
  async confirmaciones(
    @Query(new ZodValidationPipe(VentasFiltrosSchema)) filtros: VentasFiltros,
  ): Promise<VentasConfirmacionesRespuesta> {
    return this.ventasService.listarConfirmaciones(filtros);
  }

  @Get("confirmaciones/export")
  @UseGuards(VentasLoginGuard)
  async exportar(
    @Query(new ZodValidationPipe(VentasFiltrosSchema)) filtros: VentasFiltros,
    @Res({ passthrough: true }) res: Response,
  ): Promise<string> {
    const csv = await this.ventasService.exportarCsv(filtros);

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="confirmaciones.csv"`);

    return csv;
  }
}
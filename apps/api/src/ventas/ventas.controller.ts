import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCookieAuth,
  ApiOkResponse,
  ApiOperation,
  ApiProduces,
  ApiQuery,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
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
import { Throttle, ThrottlerGuard } from "@nestjs/throttler";
import type { Response } from "express";
import type { VentasFiltros, VentasLoginInput } from "@disagro/shared";
import { VentasFiltrosSchema, VentasLoginInputSchema } from "@disagro/shared";
import { ZodValidationPipe } from "../common/zod-validation.pipe.js";
import jwtConfig from "../confirmaciones/jwt.config.js";
import { VentasConfirmacionesRespuesta } from "./dto/ventas-respuestas.dto.js";
import {
  VentasLoginInputDto,
  VentasLoginResultadoDto,
} from "./dto/ventas-login-input.dto.js";
import {
  COOKIE_VENTAS,
  LIMITE_LOGIN_VENTAS_POR_IP,
  VENTANA_LOGIN_VENTAS_MS,
} from "./ventas.constants.js";
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
  @UseGuards(ThrottlerGuard)
  @Throttle({
    default: {
      limit: LIMITE_LOGIN_VENTAS_POR_IP,
      ttl: VENTANA_LOGIN_VENTAS_MS,
    },
  })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Inicia sesión del equipo de Ventas",
    description:
      "Valida las credenciales contra el usuario de Ventas y emite una cookie de sesión " +
      "propia e independiente de la sesión de cliente (ADR-009). El endpoint está limitado " +
      "por IP (ADR-012).",
  })
  @ApiBody({
    type: VentasLoginInputDto,
    description: "Credenciales del panel de Ventas.",
  })
  @ApiOkResponse({
    description:
      "Sesión iniciada. Además del cuerpo de respuesta, se establece la cookie de sesión de Ventas.",
    type: VentasLoginResultadoDto,
  })
  @ApiUnauthorizedResponse({
    description: "Credenciales inválidas.",
  })
  @ApiTooManyRequestsResponse({
    description: `Se excedió el límite de intentos por IP (${LIMITE_LOGIN_VENTAS_POR_IP} en ${VENTANA_LOGIN_VENTAS_MS / 60000} minutos).`,
  })
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
  @ApiOperation({
    summary: "Lista confirmaciones con resumen agregado",
    description:
      "Consulta las confirmaciones de todos los clientes, con filtros opcionales por rango " +
      "de fecha/hora del evento y por ítem del catálogo, junto con un resumen agregado " +
      "(total y top 5 de ítems más solicitados).",
  })
  @ApiCookieAuth("disagro_sesion_ventas")
  @ApiQuery({
    name: "fechaDesde",
    required: false,
    description: "Incluye solo confirmaciones con fecha del evento igual o posterior a este valor (ISO 8601).",
    schema: { type: "string", format: "date-time" },
  })
  @ApiQuery({
    name: "fechaHasta",
    required: false,
    description: "Incluye solo confirmaciones con fecha del evento igual o anterior a este valor (ISO 8601).",
    schema: { type: "string", format: "date-time" },
  })
  @ApiQuery({
    name: "catalogoItemId",
    required: false,
    description: "Incluye solo confirmaciones que seleccionaron este ítem del catálogo.",
    schema: { type: "string", format: "uuid" },
  })
  @ApiOkResponse({
    description: "Listado de confirmaciones y resumen agregado.",
    type: VentasConfirmacionesRespuesta,
  })
  @ApiBadRequestResponse({
    description: "Filtros malformados o rango incoherente (fechaDesde posterior a fechaHasta).",
  })
  @ApiUnauthorizedResponse({
    description: "La cookie de sesión de Ventas es ausente, inválida o ha expirado.",
  })
  async confirmaciones(
    @Query(new ZodValidationPipe(VentasFiltrosSchema)) filtros: VentasFiltros,
  ): Promise<VentasConfirmacionesRespuesta> {
    return this.ventasService.listarConfirmaciones(filtros);
  }

  @Get("confirmaciones/export")
  @UseGuards(VentasLoginGuard)
  @ApiOperation({
    summary: "Exporta confirmaciones a CSV",
    description:
      "Genera un archivo CSV con las confirmaciones que cumplen los filtros (los mismos de " +
      "GET /ventas/confirmaciones). Una fila por confirmación; los ítems van unidos por comas.",
  })
  @ApiCookieAuth("disagro_sesion_ventas")
  @ApiProduces("text/csv; charset=utf-8")
  @ApiQuery({
    name: "fechaDesde",
    required: false,
    description: "Incluye solo confirmaciones con fecha del evento igual o posterior a este valor (ISO 8601).",
    schema: { type: "string", format: "date-time" },
  })
  @ApiQuery({
    name: "fechaHasta",
    required: false,
    description: "Incluye solo confirmaciones con fecha del evento igual o anterior a este valor (ISO 8601).",
    schema: { type: "string", format: "date-time" },
  })
  @ApiQuery({
    name: "catalogoItemId",
    required: false,
    description: "Incluye solo confirmaciones que seleccionaron este ítem del catálogo.",
    schema: { type: "string", format: "uuid" },
  })
  @ApiOkResponse({
    description: "Archivo CSV adjunto (text/csv) con BOM UTF-8.",
    schema: { type: "string" },
  })
  @ApiBadRequestResponse({
    description: "Filtros malformados o rango incoherente (fechaDesde posterior a fechaHasta).",
  })
  @ApiUnauthorizedResponse({
    description: "La cookie de sesión de Ventas es ausente, inválida o ha expirado.",
  })
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
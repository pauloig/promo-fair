import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { Body, Controller, Get, Inject, Post, Req, Res, UseGuards } from "@nestjs/common";
import type { ConfigType } from "@nestjs/config";
import { Throttle, ThrottlerGuard } from "@nestjs/throttler";
import type { Response } from "express";
import {
  ConfirmacionInputSchema,
  type ConfirmacionInput,
  type ConfirmacionResumen,
} from "@disagro/shared";
import { ZodValidationPipe } from "../common/zod-validation.pipe.js";
import { opcionesCookie } from "../common/cookie-opciones.js";
import cookiesConfig from "../common/cookies.config.js";
import { CsrfGuard } from "../csrf/csrf.guard.js";
import { ConfirmacionesService } from "./confirmaciones.service.js";
import { ConfirmacionInputDto } from "./dto/confirmacion-input.dto.js";
import {
  ConfirmacionPropia,
  ConfirmacionResumenDto,
} from "./dto/confirmacion-resumen.dto.js";
import jwtConfig from "./jwt.config.js";
import {
  LIMITE_CONFIRMACIONES_POR_IP,
  VENTANA_CONFIRMACIONES_MS,
} from "./rate-limit.constants.js";
import {
  SesionClienteGuard,
  type RequestConCliente,
} from "./sesion-cliente.guard.js";

@Controller("confirmaciones")
export class ConfirmacionesController {
  constructor(
    private readonly confirmacionesService: ConfirmacionesService,
    @Inject(jwtConfig.KEY)
    private readonly jwt: Readonly<ConfigType<typeof jwtConfig>>,
    @Inject(cookiesConfig.KEY)
    private readonly cookies: Readonly<ConfigType<typeof cookiesConfig>>,
  ) {}

  @Post()
  @UseGuards(CsrfGuard, ThrottlerGuard)
  @Throttle({
    default: {
      limit: LIMITE_CONFIRMACIONES_POR_IP,
      ttl: VENTANA_CONFIRMACIONES_MS,
    },
  })
  @ApiOperation({
    summary: "Registra o actualiza la confirmación de asistencia",
    description:
      "El correo electrónico es la clave de idempotencia (ADR-006): si ya existe una " +
      "confirmación para el mismo correo, se actualiza y el estado anterior se guarda en el historial. " +
      "Los nombres y precios de los ítems se congelan al confirmar (ADR-007), los descuentos se calculan " +
      "en el servidor (ADR-001/ADR-002) y se emite una cookie de sesión JWT de cliente de 30 días (ADR-003). " +
      "El endpoint está limitado por IP (ADR-011) y protegido contra CSRF con doble cookie (ADR-012): " +
      "requiere la cabecera X-CSRF-Token con el valor de la cookie `disagro_csrf`.",
  })
  @ApiBody({
    type: ConfirmacionInputDto,
    description: "Datos de la confirmación: datos del cliente, fecha de asistencia e ítems seleccionados.",
  })
  @ApiCreatedResponse({
    description:
      "Confirmación creada (o actualizada si el correo ya existía). Además de este cuerpo, " +
      "se establece la cookie de sesión de cliente.",
    type: ConfirmacionResumenDto,
  })
  @ApiBadRequestResponse({
    description: "Datos de la petición inválidos, ítems inexistentes/inactivos o fecha fuera del rango del evento.",
  })
  @ApiTooManyRequestsResponse({
    description: `Se excedió el límite de confirmaciones por IP (${LIMITE_CONFIRMACIONES_POR_IP} en ${VENTANA_CONFIRMACIONES_MS / 60000} minutos).`,
  })
  @ApiForbiddenResponse({
    description:
      "La cabecera X-CSRF-Token no coincide con la cookie de token CSRF (protección CSRF).",
  })
  async confirmar(
    @Body(new ZodValidationPipe(ConfirmacionInputSchema)) input: ConfirmacionInput,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ConfirmacionResumen> {
    const { token, resumen } = await this.confirmacionesService.confirmar(input);

    res.cookie(
      this.jwt.cookieName,
      token,
      opcionesCookie(this.cookies, true, this.jwt.expiracionDias * 24 * 60 * 60 * 1000),
    );

    return resumen;
  }

  @Get("mia")
  @UseGuards(SesionClienteGuard)
  @ApiOperation({
    summary: "Consulta la confirmación del cliente con sesión activa",
    description:
      "Permite al cliente, ya con la cookie de sesión emitida al confirmar, volver a consultar " +
      "y editar su confirmación sin autenticarse de nuevo (ADR-003).",
  })
  @ApiCookieAuth("disagro_sesion")
  @ApiOkResponse({
    description: "La confirmación registrada para el cliente autenticado.",
    type: ConfirmacionPropia,
  })
  @ApiUnauthorizedResponse({
    description: "La cookie de sesión de cliente es ausente, inválida o ha expirado.",
  })
  @ApiNotFoundResponse({
    description: "El cliente autenticado aún no tiene una confirmación registrada.",
  })
  async miConfirmacion(@Req() request: RequestConCliente): Promise<ConfirmacionPropia> {
    return this.confirmacionesService.mia(request.clienteId);
  }
}
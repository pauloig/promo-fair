import { Body, Controller, Inject, Post, Res, UseGuards } from "@nestjs/common";
import type { ConfigType } from "@nestjs/config";
import { Throttle, ThrottlerGuard } from "@nestjs/throttler";
import type { Response } from "express";
import {
  ConfirmacionInputSchema,
  type ConfirmacionInput,
  type ConfirmacionResumen,
} from "@disagro/shared";
import { ZodValidationPipe } from "../common/zod-validation.pipe.js";
import { ConfirmacionesService } from "./confirmaciones.service.js";
import jwtConfig from "./jwt.config.js";
import {
  LIMITE_CONFIRMACIONES_POR_IP,
  VENTANA_CONFIRMACIONES_MS,
} from "./rate-limit.constants.js";

@Controller("confirmaciones")
@UseGuards(ThrottlerGuard)
@Throttle({
  default: {
    limit: LIMITE_CONFIRMACIONES_POR_IP,
    ttl: VENTANA_CONFIRMACIONES_MS,
  },
})
export class ConfirmacionesController {
  constructor(
    private readonly confirmacionesService: ConfirmacionesService,
    @Inject(jwtConfig.KEY)
    private readonly jwt: Readonly<ConfigType<typeof jwtConfig>>,
  ) {}

  @Post()
  async confirmar(
    @Body(new ZodValidationPipe(ConfirmacionInputSchema)) input: ConfirmacionInput,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ConfirmacionResumen> {
    const { token, resumen } = await this.confirmacionesService.confirmar(input);

    res.cookie(this.jwt.cookieName, token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: this.jwt.expiracionDias * 24 * 60 * 60 * 1000,
      path: "/",
    });

    return resumen;
  }
}
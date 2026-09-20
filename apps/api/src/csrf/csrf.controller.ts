import { randomBytes } from "node:crypto";
import { Controller, Get, Res } from "@nestjs/common";
import { ApiOkResponse, ApiOperation } from "@nestjs/swagger";
import type { Response } from "express";
import { COOKIE_CSRF, EXPIRACION_CSRF_MS } from "./csrf.constants.js";

@Controller("csrf-token")
export class CsrfController {
  @Get()
  @ApiOperation({
    summary: "Emite el token CSRF de doble cookie",
    description:
      "Genera un token aleatorio y lo entrega en una cookie no httpOnly (legible por el " +
      "frontend) más el cuerpo de la respuesta. El frontend debe reenviarlo en la cabecera " +
      "X-CSRF-Token en cada petición de escritura (ADR-012).",
  })
  @ApiOkResponse({
    description:
      "Token generado. La cookie non-httpOnly `disagro_csrf` se establece en la respuesta.",
    schema: { type: "object", properties: { token: { type: "string" } } },
  })
  emitirToken(
    @Res({ passthrough: true }) res: Response,
  ): { token: string } {
    const token = randomBytes(32).toString("hex");

    res.cookie(COOKIE_CSRF, token, {
      httpOnly: false,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: EXPIRACION_CSRF_MS,
    });

    return { token };
  }
}
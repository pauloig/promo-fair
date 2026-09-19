import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import type { ConfigType } from "@nestjs/config";
import type { Request } from "express";
import jwt from "jsonwebtoken";
import { leerCookieDe } from "../common/cookie.util.js";
import jwtConfig from "../confirmaciones/jwt.config.js";
import { COOKIE_VENTAS, ROL_VENTAS } from "./ventas.constants.js";

@Injectable()
export class VentasLoginGuard implements CanActivate {
  constructor(
    @Inject(jwtConfig.KEY)
    private readonly jwt: Readonly<ConfigType<typeof jwtConfig>>,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();

    const token = leerCookieDe(request, COOKIE_VENTAS);
    if (token === undefined) {
      throw new UnauthorizedException(
        "No hay una sesión de Ventas válida: falta la cookie de sesión",
      );
    }

    try {
      jwt.verify(token, this.jwt.secret, {
        algorithms: ["HS256"],
        audience: ROL_VENTAS,
      });
    } catch {
      throw new UnauthorizedException(
        "No hay una sesión de Ventas válida: el token es inválido o ha expirado",
      );
    }

    return true;
  }
}
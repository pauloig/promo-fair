import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import type { Request } from "express";
import { leerCookieDe } from "../common/cookie.util.js";
import { CABECERA_CSRF, COOKIE_CSRF } from "./csrf.constants.js";

@Injectable()
export class CsrfGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();

    const cookie = leerCookieDe(request, COOKIE_CSRF);
    const encabezado = request.headers[CABECERA_CSRF];
    if (encabezado === undefined) {
      throw new ForbiddenException(
        `Petición rechazada: falta la cabecera ${CABECERA_CSRF}`,
      );
    }

    const valor = Array.isArray(encabezado) ? encabezado[0] : encabezado;
    if (cookie === undefined || valor !== cookie) {
      throw new ForbiddenException(
        "Petición rechazada: el token CSRF no coincide con la cookie",
      );
    }

    return true;
  }
}
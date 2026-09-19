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
import jwtConfig from "./jwt.config.js";

export interface RequestConCliente extends Request {
  clienteId: string;
}

@Injectable()
export class SesionClienteGuard implements CanActivate {
  constructor(
    @Inject(jwtConfig.KEY)
    private readonly jwt: Readonly<ConfigType<typeof jwtConfig>>,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();

    const token = this.leerCookieDeSesion(request);
    if (token === undefined) {
      throw new UnauthorizedException(
        "No hay una sesión de cliente válida: falta la cookie de sesión",
      );
    }

    let payload: jwt.JwtPayload;
    try {
      payload = jwt.verify(token, this.jwt.secret, {
        algorithms: ["HS256"],
      }) as jwt.JwtPayload;
    } catch {
      throw new UnauthorizedException(
        "No hay una sesión de cliente válida: el token es inválido o ha expirado",
      );
    }

    const clienteId = payload.sub;
    if (typeof clienteId !== "string" || clienteId === "") {
      throw new UnauthorizedException(
        "No hay una sesión de cliente válida: el token no identifica a un cliente",
      );
    }

    (request as RequestConCliente).clienteId = clienteId;
    return true;
  }

  private leerCookieDeSesion(request: Request): string | undefined {
    const cabecera = request.headers.cookie;
    if (cabecera === undefined) return undefined;

    for (const segmento of cabecera.split(";")) {
      const igual = segmento.indexOf("=");
      if (igual === -1) continue;

      const nombre = segmento.slice(0, igual).trim();
      const valor = segmento.slice(igual + 1);
      if (nombre !== this.jwt.cookieName) continue;

      try {
        return decodeURIComponent(valor.trim());
      } catch {
        return undefined;
      }
    }

    return undefined;
  }
}
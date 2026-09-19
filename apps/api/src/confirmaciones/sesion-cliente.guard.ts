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

    const token = leerCookieDe(request, this.jwt.cookieName);
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
}
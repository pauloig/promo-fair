import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import type { Request, Response } from "express";
import { escribirLog } from "./json-logger.js";

export interface CuerpoError {
  statusCode: number;
  message: string;
  timestamp: string;
  path: string;
}

@Catch()
export class ErrorFormateadoFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const contexto = host.switchToHttp();
    const respuesta = contexto.getResponse<Response>();
    const peticion = contexto.getRequest<Request>();

    const { statusCode, message } = this.detalleDe(exception);

    if (statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
      escribirLog("error", "Fallo no controlado durante la petición", {
        metodo: peticion.method,
        ruta: peticion.originalUrl,
        statusCode,
        ...(exception instanceof Error ? { error: exception.name, stack: exception.stack } : {}),
      });
    }

    const cuerpo: CuerpoError = {
      statusCode,
      message,
      timestamp: new Date().toISOString(),
      path: peticion.originalUrl,
    };

    respuesta.status(statusCode).json(cuerpo);
  }

  private detalleDe(exception: unknown): {
    statusCode: number;
    message: string;
  } {
    if (exception instanceof HttpException) {
      return {
        statusCode: exception.getStatus(),
        message: this.mensajeDe(exception),
      };
    }

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: "Error interno del servidor",
    };
  }

  private mensajeDe(exception: HttpException): string {
    const respuesta = exception.getResponse();

    if (typeof respuesta === "string") {
      return respuesta;
    }

    if (typeof respuesta === "object" && respuesta !== null) {
      const message = (respuesta as { message?: unknown }).message;
      if (Array.isArray(message)) {
        return message.length > 0 ? message.join("; ") : "Error";
      }
      if (typeof message === "string") {
        return message;
      }
      if (message !== undefined) {
        return JSON.stringify(message);
      }
    }

    return exception.message;
  }
}
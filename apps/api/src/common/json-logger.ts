import type { LoggerService } from "@nestjs/common";
import type { NextFunction, Request, Response } from "express";

export type NivelLog = "log" | "error" | "warn" | "debug" | "verbose";

export function escribirLog(
  nivel: NivelLog,
  mensaje: string,
  contexto: Record<string, unknown> = {},
): void {
  const entrada = {
    nivel,
    mensaje,
    timestamp: new Date().toISOString(),
    ...contexto,
  };
  const linea = `${JSON.stringify(entrada)}\n`;
  if (nivel === "error") {
    process.stderr.write(linea);
  } else {
    process.stdout.write(linea);
  }
}

function describir(mensaje: unknown): { mensaje: string; contexto: Record<string, unknown> } {
  if (mensaje instanceof Error) {
    return {
      mensaje: mensaje.message,
      contexto: { error: mensaje.name, stack: mensaje.stack },
    };
  }
  if (typeof mensaje === "object" && mensaje !== null) {
    return { mensaje: "evento del framework", contexto: mensaje as Record<string, unknown> };
  }
  return { mensaje: String(mensaje ?? ""), contexto: {} };
}

export class JsonLoggerService implements LoggerService {
  log(mensaje: unknown, ...parametros: unknown[]): void {
    this.guardar("log", mensaje, parametros);
  }

  error(mensaje: unknown, ...parametros: unknown[]): void {
    this.guardar("error", mensaje, parametros);
  }

  warn(mensaje: unknown, ...parametros: unknown[]): void {
    this.guardar("warn", mensaje, parametros);
  }

  debug(mensaje: unknown, ...parametros: unknown[]): void {
    this.guardar("debug", mensaje, parametros);
  }

  verbose(mensaje: unknown, ...parametros: unknown[]): void {
    this.guardar("verbose", mensaje, parametros);
  }

  private guardar(nivel: NivelLog, mensaje: unknown, parametros: unknown[]): void {
    const { mensaje: mensajePlano, contexto } = describir(mensaje);
    const contextoNombrado = parametros
      .filter((parametro): parametro is string => typeof parametro === "string")
      .join(" ");
    escribirLog(nivel, mensajePlano, {
      ...contexto,
      ...(contextoNombrado !== "" ? { contexto: contextoNombrado } : {}),
    });
  }
}

export function crearLogDePeticiones() {
  return (peticion: Request, respuesta: Response, siguiente: NextFunction): void => {
    if (process.env.NODE_ENV === "test") {
      siguiente();
      return;
    }

    const inicio = process.hrtime();
    respuesta.on("finish", () => {
      const transcurrido = process.hrtime(inicio);
      const duracionMs = Math.round(
        (transcurrido[0] * 1e9 + transcurrido[1]) / 1e6,
      );
      escribirLog(respuesta.statusCode >= 500 ? "error" : "log", "petición http", {
        metodo: peticion.method,
        ruta: peticion.originalUrl,
        estado: respuesta.statusCode,
        duracionMs,
        ip: peticion.ip ?? peticion.socket.remoteAddress,
      });
    });
    siguiente();
  };
}
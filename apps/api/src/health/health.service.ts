import { Injectable } from "@nestjs/common";
import { escribirLog } from "../common/json-logger.js";
import { PrismaService } from "../prisma/prisma.service.js";

export type EstadoBaseDeDatos = "ok" | "error";

@Injectable()
export class HealthService {
  constructor(private readonly prisma: PrismaService) {}

  async verificarBaseDeDatos(): Promise<EstadoBaseDeDatos> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return "ok";
    } catch (error) {
      const detalle = error instanceof Error ? error.message : "error desconocido";
      escribirLog("error", "Falló la verificación de la base de datos", { detalle });
      return "error";
    }
  }
}
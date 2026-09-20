import {
  Controller,
  Get,
  HttpStatus,
  Res,
} from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiProperty, ApiServiceUnavailableResponse } from "@nestjs/swagger";
import type { Response } from "express";
import {
  HealthService,
  type EstadoBaseDeDatos,
} from "./health.service.js";

export class HealthResponseDto {
  @ApiProperty({
    description: "Estado general del servicio.",
    enum: ["ok", "error"],
    example: "ok",
  })
  readonly status!: "ok" | "error";

  @ApiProperty({
    description: "Estado de la conexión con la base de datos.",
    enum: ["ok", "error"],
    example: "ok",
  })
  readonly db!: EstadoBaseDeDatos;

  @ApiProperty({
    description: "Marca de tiempo del chequeo (ISO 8601).",
    format: "date-time",
  })
  readonly timestamp!: string;
}

@Controller("health")
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({
    summary: "Chequeo de salud del servicio",
    description: "Confirma que la API responde y que la conexión con la base de datos está operativa.",
  })
  @ApiOkResponse({
    description: "La API y la base de datos responden correctamente.",
    type: HealthResponseDto,
  })
  @ApiServiceUnavailableResponse({
    description: "La API responde, pero la base de datos no está disponible.",
    type: HealthResponseDto,
  })
  async health(
    @Res({ passthrough: true }) respuesta: Response,
  ): Promise<HealthResponseDto> {
    const db = await this.healthService.verificarBaseDeDatos();
    const estadoOK = db === "ok";

    if (!estadoOK) {
      respuesta.status(HttpStatus.SERVICE_UNAVAILABLE);
    }

    return {
      status: estadoOK ? "ok" : "error",
      db,
      timestamp: new Date().toISOString(),
    };
  }
}
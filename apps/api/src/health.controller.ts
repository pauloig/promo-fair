import { ApiOkResponse, ApiOperation, ApiProperty } from "@nestjs/swagger";
import { Controller, Get } from "@nestjs/common";

export class HealthResponseDto {
  @ApiProperty({
    description: "Estado del servicio.",
    enum: ["ok"],
    example: "ok",
  })
  readonly status!: "ok";

  @ApiProperty({
    description: "Marca de tiempo del chequeo (ISO 8601).",
    format: "date-time",
  })
  readonly timestamp!: string;
}

@Controller("health")
export class HealthController {
  @Get()
  @ApiOperation({
    summary: "Chequeo de salud del servicio",
    description: "Utilizado por el proxy y monitoreo para confirmar que la API responde.",
  })
  @ApiOkResponse({
    description: "La API responde correctamente.",
    type: HealthResponseDto,
  })
  health(): HealthResponseDto {
    return { status: "ok", timestamp: new Date().toISOString() };
  }
}
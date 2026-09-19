import { ApiProperty } from "@nestjs/swagger";

export class RangoFechaDto {
  @ApiProperty({
    description: "Inicio del rango de fecha/hora permitido para el evento (ISO 8601).",
    format: "date-time",
    example: "2026-11-21T08:00:00-06:00",
  })
  readonly fechaInicio!: string;

  @ApiProperty({
    description: "Fin del rango de fecha/hora permitido para el evento (ISO 8601).",
    format: "date-time",
    example: "2026-11-22T18:00:00-06:00",
  })
  readonly fechaFin!: string;
}
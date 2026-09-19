import { ApiProperty } from "@nestjs/swagger";

export class ClienteDto {
  @ApiProperty({
    description: "Nombre(s) del cliente. Se guardan junto con la confirmación.",
    example: "José",
    minLength: 1,
  })
  readonly nombre!: string;

  @ApiProperty({
    description: "Apellido(s) del cliente.",
    example: "Pérez López",
    minLength: 1,
  })
  readonly apellidos!: string;

  @ApiProperty({
    description:
      "Correo electrónico del cliente. Es la clave de idempotencia (ADR-006): " +
      "una segunda confirmación con el mismo correo actualiza la existente.",
    format: "email",
    example: "cliente@example.com",
  })
  readonly email!: string;
}

export class ConfirmacionInputDto {
  @ApiProperty({
    description: "Datos del cliente que confirma su asistencia.",
    type: () => ClienteDto,
  })
  readonly cliente!: ClienteDto;

  @ApiProperty({
    description:
      "Fecha y hora en que el cliente asistirá al evento. Debe estar dentro del " +
      "rango configurado para el evento (ADR-010).",
    format: "date-time",
    example: "2026-11-21T09:00:00-06:00",
  })
  readonly fechaHoraEvento!: string;

  @ApiProperty({
    description:
      "Identificadores (UUID) de los servicios y/o productos seleccionados. " +
      "Debe incluir al menos un ítem (ADR-005).",
    type: [String],
    example: ["d2f0c550-4e9b-4c2a-9f1a-3c0f0a2b5f01"],
    minItems: 1,
  })
  readonly itemIds!: string[];
}
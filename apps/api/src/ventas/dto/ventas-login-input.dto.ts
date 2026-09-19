import { ApiProperty } from "@nestjs/swagger";

export class VentasLoginInputDto {
  @ApiProperty({
    description: "Nombre de usuario del equipo de Ventas.",
    example: "ventas",
    minLength: 1,
  })
  readonly username!: string;

  @ApiProperty({
    description: "Contraseña del usuario de Ventas.",
    example: "********",
    minLength: 1,
    writeOnly: true,
  })
  readonly password!: string;
}

export class VentasLoginResultadoDto {
  @ApiProperty({
    description: "Resultado del inicio de sesión.",
    example: true,
  })
  readonly ok!: boolean;
}
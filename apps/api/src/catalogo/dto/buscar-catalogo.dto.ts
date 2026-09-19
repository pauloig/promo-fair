import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, MaxLength } from "class-validator";

export class BuscarCatalogoDto {
  @ApiPropertyOptional({
    description: "Filtra los ítems por coincidencia parcial en el nombre.",
    example: "glifosato",
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  buscar?: string;
}
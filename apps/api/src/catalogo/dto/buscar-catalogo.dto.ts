import { IsOptional, IsString, MaxLength } from "class-validator";

export class BuscarCatalogoDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  buscar?: string;
}
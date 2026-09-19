import { ApiOkResponse, ApiOperation } from "@nestjs/swagger";
import { Controller, Get, Query } from "@nestjs/common";
import { CatalogoService } from "./catalogo.service.js";
import { BuscarCatalogoDto } from "./dto/buscar-catalogo.dto.js";
import { CatalogoItemDto } from "./dto/catalogo-item.dto.js";

@Controller("catalogo")
export class CatalogoController {
  constructor(private readonly catalogoService: CatalogoService) {}

  @Get()
  @ApiOperation({
    summary: "Lista el catálogo de servicios y productos",
    description:
      "Devuelve los ítems activos del catálogo (servicios y productos) con su precio vigente. " +
      "Acepta un filtro opcional por nombre. Es el endpoint público que consume el frontend del cliente.",
  })
  @ApiOkResponse({
    description: "Ítems activos del catálogo.",
    type: CatalogoItemDto,
    isArray: true,
  })
  listar(@Query() query: BuscarCatalogoDto): Promise<CatalogoItemDto[]> {
    return this.catalogoService.listar(query);
  }
}
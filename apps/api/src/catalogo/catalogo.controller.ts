import { Controller, Get, Query } from "@nestjs/common";
import { CatalogoService } from "./catalogo.service.js";
import { BuscarCatalogoDto } from "./dto/buscar-catalogo.dto.js";
import type { CatalogoItemDto } from "./dto/catalogo-item.dto.js";

@Controller("catalogo")
export class CatalogoController {
  constructor(private readonly catalogoService: CatalogoService) {}

  @Get()
  listar(@Query() query: BuscarCatalogoDto): Promise<CatalogoItemDto[]> {
    return this.catalogoService.listar(query);
  }
}
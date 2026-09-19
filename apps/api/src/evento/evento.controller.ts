import { Controller, Get } from "@nestjs/common";
import { EventoService } from "./evento.service.js";
import type { RangoFechaDto } from "./rango-fecha.dto.js";

@Controller("evento")
export class EventoController {
  constructor(private readonly eventoService: EventoService) {}

  @Get("rango-fecha")
  rangoFecha(): RangoFechaDto {
    return this.eventoService.rangoFecha();
  }
}
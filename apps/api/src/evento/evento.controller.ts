import { ApiOkResponse, ApiOperation } from "@nestjs/swagger";
import { Controller, Get } from "@nestjs/common";
import { EventoService } from "./evento.service.js";
import { RangoFechaDto } from "./rango-fecha.dto.js";

@Controller("evento")
export class EventoController {
  constructor(private readonly eventoService: EventoService) {}

  @Get("rango-fecha")
  @ApiOperation({
    summary: "Obtiene el rango de fecha/hora habilitado del evento",
    description:
      "Devuelve el rango (inicio y fin) configurado por variables de entorno (ADR-010). " +
      "El frontend lo usa para limitar el selector de fecha y hora de la confirmación.",
  })
  @ApiOkResponse({
    description: "Rango de fecha/hora del evento.",
    type: RangoFechaDto,
  })
  rangoFecha(): RangoFechaDto {
    return this.eventoService.rangoFecha();
  }
}
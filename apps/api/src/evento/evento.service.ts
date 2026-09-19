import { Inject, Injectable } from "@nestjs/common";
import type { ConfigType } from "@nestjs/config";
import eventoConfig from "./evento.config.js";
import type { RangoFechaDto } from "./rango-fecha.dto.js";

@Injectable()
export class EventoService {
  constructor(
    @Inject(eventoConfig.KEY)
    private readonly config: Readonly<ConfigType<typeof eventoConfig>>,
  ) {}

  rangoFecha(): RangoFechaDto {
    return {
      fechaInicio: this.config.fechaInicio,
      fechaFin: this.config.fechaFin,
    };
  }
}
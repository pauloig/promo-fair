import { registerAs } from "@nestjs/config";

export interface EventoConfig {
  readonly fechaInicio: string;
  readonly fechaFin: string;
}

export const eventoConfigFactory = (): Readonly<EventoConfig> => {
  const fechaInicio = process.env.EVENTO_FECHA_INICIO;
  const fechaFin = process.env.EVENTO_FECHA_FIN;

  if (fechaInicio === undefined || fechaInicio.trim() === "") {
    throw new Error(
      "La variable de entorno EVENTO_FECHA_INICIO es requerida y no está definida (formato ISO 8601)",
    );
  }
  if (fechaFin === undefined || fechaFin.trim() === "") {
    throw new Error(
      "La variable de entorno EVENTO_FECHA_FIN es requerida y no está definida (formato ISO 8601)",
    );
  }

  return { fechaInicio, fechaFin };
};

const eventoConfig = registerAs<EventoConfig>("evento", eventoConfigFactory);

export default eventoConfig;
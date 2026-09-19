import { BadRequestException } from "@nestjs/common";
import type { PipeTransform } from "@nestjs/common";
import type { ZodError, ZodSchema } from "zod";

export class ZodValidationPipe<T> implements PipeTransform<unknown, T> {
  constructor(private readonly schema: ZodSchema<T>) {}

  transform(value: unknown): T {
    const resultado = this.schema.safeParse(value);

    if (!resultado.success) {
      throw new BadRequestException(this.formatearErrores(resultado.error));
    }

    return resultado.data;
  }

  private formatearErrores(error: ZodError): string {
    const detalle = error.issues
      .map((issue) => {
        const camino = issue.path.length > 0 ? issue.path.join(".") : "body";
        return `${camino}: ${issue.message}`;
      })
      .join("; ");

    return `Los datos de la petición no son válidos (${detalle})`;
  }
}
import type { ConfirmacionInput } from "@disagro/shared/schemas";
import { Controller } from "react-hook-form";
import type { Control, FieldErrors } from "react-hook-form";
import {
  datetimeLocalAIso,
  formatoFechaLegible,
  isoADatetimeLocal,
} from "../lib/fecha";
import { EncabezadoSeccion } from "./EncabezadoSeccion";
import { CampoFecha } from "./campos/CampoFecha";
import { CampoTexto } from "./campos/CampoTexto";

type Props = {
  control: Control<ConfirmacionInput>;
  errores: FieldErrors<ConfirmacionInput>;
  rango: { fechaInicio: string; fechaFin: string } | null;
  rangoError?: string | null;
  disposicion?: "apilado" | "cuadricula";
};

export function FormularioDatos({
  control,
  errores,
  rango,
  rangoError = null,
  disposicion = "apilado",
}: Props) {
  const cuadricula = disposicion === "cuadricula";

  return (
    <section className="flex flex-col gap-3">
      <EncabezadoSeccion numero={1} titulo="Ingrese su información" />

      <div
        className={`rounded-xl border border-[#e1e5e8] bg-white p-5 shadow-sm ${
          cuadricula
            ? "grid grid-cols-1 gap-4 sm:grid-cols-2"
            : "flex flex-col gap-4"
        }`}
      >
        <Controller
          control={control}
          name="cliente.nombre"
          render={({ field, fieldState }) => (
            <CampoTexto
              id="nombre"
              etiqueta="Nombre:"
              placeholder="Introduzca su nombre"
              autoCompletar="given-name"
              valor={field.value}
              onCambio={field.onChange}
              error={fieldState.error?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="cliente.apellidos"
          render={({ field, fieldState }) => (
            <CampoTexto
              id="apellidos"
              etiqueta="Apellidos:"
              placeholder="Introduzca sus apellidos"
              autoCompletar="family-name"
              valor={field.value}
              onCambio={field.onChange}
              error={fieldState.error?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="cliente.email"
          render={({ field, fieldState }) => (
            <CampoTexto
              id="correo"
              etiqueta="Email:"
              placeholder="Introduzca su Email"
              autoCompletar="email"
              tipo="email"
              valor={field.value}
              onCambio={field.onChange}
              error={fieldState.error?.message}
            />
          )}
        />
        <div className={cuadricula ? "sm:col-span-1" : ""}>
          <Controller
            control={control}
            name="fechaHoraEvento"
            render={({ field, fieldState }) => (
              <CampoFecha
                valor={isoADatetimeLocal(field.value)}
                onCambio={(naiva) => field.onChange(datetimeLocalAIso(naiva))}
                min={rango ? isoADatetimeLocal(rango.fechaInicio) : undefined}
                max={rango ? isoADatetimeLocal(rango.fechaFin) : undefined}
                error={errores.fechaHoraEvento?.message}
                pista={
                  rango !== null
                    ? `El evento se realiza entre el ${formatoFechaLegible(
                        rango.fechaInicio,
                      )} y el ${formatoFechaLegible(rango.fechaFin)}`
                    : (rangoError ??
                      "Consultando el rango de fecha del evento…")
                }
              />
            )}
          />
        </div>
      </div>
    </section>
  );
}

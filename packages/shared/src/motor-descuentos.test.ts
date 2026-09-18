import { describe, expect, it } from "vitest";
import { calcularDescuentos } from "./motor-descuentos.js";

const servicio = (precioCentavos: number) => ({
  tipo: "SERVICIO" as const,
  precioCentavos,
});

const producto = (precioCentavos: number) => ({
  tipo: "PRODUCTO" as const,
  precioCentavos,
});

describe("calcularDescuentos", () => {
  it("1 servicio → 0% en servicios y 0% en productos", () => {
    expect(calcularDescuentos([servicio(100_000)])).toEqual({
      descuentoServiciosPct: 0,
      descuentoProductosPct: 0,
    });
  });

  it("exactamente 2 servicios sumando 150000 centavos → 3% (no 5%, la condición es estrictamente mayor)", () => {
    expect(
      calcularDescuentos([servicio(100_000), servicio(50_000)]),
    ).toEqual({
      descuentoServiciosPct: 3,
      descuentoProductosPct: 0,
    });
  });

  it("exactamente 2 servicios sumando 150001 centavos → 5%", () => {
    expect(
      calcularDescuentos([servicio(100_000), servicio(50_001)]),
    ).toEqual({
      descuentoServiciosPct: 5,
      descuentoProductosPct: 0,
    });
  });

  it("2 productos → 0% en productos y 0% en servicios", () => {
    expect(calcularDescuentos([producto(10_000), producto(10_000)])).toEqual({
      descuentoServiciosPct: 0,
      descuentoProductosPct: 0,
    });
  });

  it("exactamente 3 productos → 3%", () => {
    expect(
      calcularDescuentos([
        producto(10_000),
        producto(10_000),
        producto(10_000),
      ]),
    ).toEqual({
      descuentoServiciosPct: 0,
      descuentoProductosPct: 3,
    });
  });

  it("exactamente 5 productos → 5%", () => {
    expect(
      calcularDescuentos([
        producto(10_000),
        producto(10_000),
        producto(10_000),
        producto(10_000),
        producto(10_000),
      ]),
    ).toEqual({
      descuentoServiciosPct: 0,
      descuentoProductosPct: 5,
    });
  });

  it("selección vacía → 0% y 0% sin error", () => {
    expect(calcularDescuentos([])).toEqual({
      descuentoServiciosPct: 0,
      descuentoProductosPct: 0,
    });
  });

  it("solo servicios sin productos → categoría ausente en 0% sin error", () => {
    expect(
      calcularDescuentos([
        servicio(40_000),
        servicio(40_000),
        servicio(40_000),
      ]),
    ).toEqual({
      descuentoServiciosPct: 3,
      descuentoProductosPct: 0,
    });
  });

  it("solo productos sin servicios → categoría ausente en 0% sin error", () => {
    expect(
      calcularDescuentos([producto(5_000), producto(5_000), producto(5_000)]),
    ).toEqual({
      descuentoServiciosPct: 0,
      descuentoProductosPct: 3,
    });
  });
});
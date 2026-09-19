import "dotenv/config";
import { Test } from "@nestjs/testing";
import type { INestApplication } from "@nestjs/common";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { AppModule } from "../src/app.module.js";
import { configureApp } from "../src/app.setup.js";
import {
  VENTAS_TEST_PASSWORD,
  VENTAS_TEST_USERNAME,
} from "./helpers.js";

const FECHA_INICIO = "2026-11-21T08:00:00-06:00";
const FECHA_FIN = "2026-11-22T18:00:00-06:00";

let app: INestApplication;
let originalFechaInicio: string | undefined;
let originalFechaFin: string | undefined;
let originalVentasUsername: string | undefined;
let originalVentasPassword: string | undefined;

async function crearApp(): Promise<INestApplication> {
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
  const nueva = moduleRef.createNestApplication();
  configureApp(nueva);
  await nueva.init();
  return nueva;
}

beforeAll(async () => {
  originalFechaInicio = process.env.EVENTO_FECHA_INICIO;
  originalFechaFin = process.env.EVENTO_FECHA_FIN;
  originalVentasUsername = process.env.VENTAS_USERNAME;
  originalVentasPassword = process.env.VENTAS_PASSWORD;
  process.env.EVENTO_FECHA_INICIO = FECHA_INICIO;
  process.env.EVENTO_FECHA_FIN = FECHA_FIN;
  process.env.VENTAS_USERNAME = VENTAS_TEST_USERNAME;
  process.env.VENTAS_PASSWORD = VENTAS_TEST_PASSWORD;

  app = await crearApp();
});

afterAll(async () => {
  await app?.close();
  if (originalFechaInicio !== undefined) {
    process.env.EVENTO_FECHA_INICIO = originalFechaInicio;
  } else {
    delete process.env.EVENTO_FECHA_INICIO;
  }
  if (originalFechaFin !== undefined) {
    process.env.EVENTO_FECHA_FIN = originalFechaFin;
  } else {
    delete process.env.EVENTO_FECHA_FIN;
  }
  if (originalVentasUsername !== undefined) {
    process.env.VENTAS_USERNAME = originalVentasUsername;
  } else {
    delete process.env.VENTAS_USERNAME;
  }
  if (originalVentasPassword !== undefined) {
    process.env.VENTAS_PASSWORD = originalVentasPassword;
  } else {
    delete process.env.VENTAS_PASSWORD;
  }
});

describe("GET /api/evento/rango-fecha", () => {
  it("devuelve el rango configurado desde las variables de entorno", async () => {
    const respuesta = await request(app.getHttpServer())
      .get("/api/evento/rango-fecha")
      .expect(200);

    expect(respuesta.body).toEqual({
      fechaInicio: FECHA_INICIO,
      fechaFin: FECHA_FIN,
    });
  });
});

describe("Configuración del rango de fecha/hora del evento", () => {
  it("impide arrancar la aplicación si falta EVENTO_FECHA_INICIO", async () => {
    delete process.env.EVENTO_FECHA_INICIO;
    await expect(crearApp()).rejects.toThrow(/EVENTO_FECHA_INICIO/);
    process.env.EVENTO_FECHA_INICIO = FECHA_INICIO;
  });

  it("impide arrancar la aplicación si falta EVENTO_FECHA_FIN", async () => {
    delete process.env.EVENTO_FECHA_FIN;
    await expect(crearApp()).rejects.toThrow(/EVENTO_FECHA_FIN/);
    process.env.EVENTO_FECHA_FIN = FECHA_FIN;
  });
});

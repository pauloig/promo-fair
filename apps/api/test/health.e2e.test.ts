import "dotenv/config";
import { Test } from "@nestjs/testing";
import type { INestApplication } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { Pool } from "pg";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { AppModule } from "../src/app.module.js";
import { configureApp } from "../src/app.setup.js";
import jwtConfig from "../src/confirmaciones/jwt.config.js";
import eventoConfig from "../src/evento/evento.config.js";
import { HealthModule } from "../src/health/health.module.js";
import { HealthResponseDto } from "../src/health/health.controller.js";
import ventasConfig from "../src/ventas/ventas.config.js";
import {
  applyMigrations,
  createTestDatabase,
  VENTAS_TEST_PASSWORD,
  VENTAS_TEST_USERNAME,
} from "./helpers.js";

const EVENTO_FECHA_INICIO = "2026-11-21T08:00:00-06:00";
const EVENTO_FECHA_FIN = "2026-11-22T18:00:00-06:00";
const JWT_SECRET_E2E = "secreto-de-prueba-e2e-health";
const DATABASE_URL_SIN_BASE =
  "postgresql://disagro:disagro@127.0.0.1:1/disagro_inexistente";

let app: INestApplication;
let appSinBase: INestApplication;
let adminPool: Pool;
let testDatabaseUrl: string;
let originalDatabaseUrl: string | undefined;
let originalFechaInicio: string | undefined;
let originalFechaFin: string | undefined;
let originalVentasUsername: string | undefined;
let originalVentasPassword: string | undefined;
let originalJwtSecret: string | undefined;

async function crearApp(): Promise<INestApplication> {
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
  const nueva = moduleRef.createNestApplication();
  configureApp(nueva);
  await nueva.init();
  return nueva;
}

async function crearAppSoloHealth(): Promise<INestApplication> {
  const moduleRef = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({
        isGlobal: true,
        load: [eventoConfig, jwtConfig, ventasConfig],
      }),
      HealthModule,
    ],
  }).compile();
  const nueva = moduleRef.createNestApplication();
  configureApp(nueva);
  await nueva.init();
  return nueva;
}

beforeAll(async () => {
  originalDatabaseUrl = process.env.DATABASE_URL;
  originalFechaInicio = process.env.EVENTO_FECHA_INICIO;
  originalFechaFin = process.env.EVENTO_FECHA_FIN;
  originalVentasUsername = process.env.VENTAS_USERNAME;
  originalVentasPassword = process.env.VENTAS_PASSWORD;
  originalJwtSecret = process.env.JWT_SECRET;
  process.env.EVENTO_FECHA_INICIO = EVENTO_FECHA_INICIO;
  process.env.EVENTO_FECHA_FIN = EVENTO_FECHA_FIN;
  process.env.VENTAS_USERNAME = VENTAS_TEST_USERNAME;
  process.env.VENTAS_PASSWORD = VENTAS_TEST_PASSWORD;
  process.env.JWT_SECRET = JWT_SECRET_E2E;

  const created = await createTestDatabase("health");
  adminPool = created.adminPool;
  testDatabaseUrl = created.databaseUrl;
  await applyMigrations(testDatabaseUrl);
  process.env.DATABASE_URL = testDatabaseUrl;

  app = await crearApp();

  process.env.DATABASE_URL = DATABASE_URL_SIN_BASE;
  appSinBase = await crearAppSoloHealth();
}, 180_000);

afterAll(async () => {
  await appSinBase?.close();
  await app?.close();
  if (adminPool) {
    const databaseName = new URL(testDatabaseUrl).pathname.slice(1);
    await adminPool.query(`DROP DATABASE IF EXISTS "${databaseName}" WITH (FORCE)`);
    await adminPool.end();
  }
  if (originalDatabaseUrl !== undefined) {
    process.env.DATABASE_URL = originalDatabaseUrl;
  } else {
    delete process.env.DATABASE_URL;
  }
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
  if (originalJwtSecret !== undefined) {
    process.env.JWT_SECRET = originalJwtSecret;
  } else {
    delete process.env.JWT_SECRET;
  }
});

describe("GET /api/health", () => {
  it("responde ok cuando la base de datos está disponible", async () => {
    const respuesta = await request(app.getHttpServer())
      .get("/api/health")
      .expect(200);

    const cuerpo = respuesta.body as HealthResponseDto;
    expect(cuerpo.status).toBe("ok");
    expect(cuerpo.db).toBe("ok");
    expect(Number.isNaN(new Date(cuerpo.timestamp).getTime())).toBe(false);
  });

  it("refleja el problema cuando la base de datos no está disponible", async () => {
    const respuesta = await request(appSinBase.getHttpServer())
      .get("/api/health")
      .expect(503);

    const cuerpo = respuesta.body as HealthResponseDto;
    expect(cuerpo.status).toBe("error");
    expect(cuerpo.db).toBe("error");
    expect(Number.isNaN(new Date(cuerpo.timestamp).getTime())).toBe(false);
  });
});
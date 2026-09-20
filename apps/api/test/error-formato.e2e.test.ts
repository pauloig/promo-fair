import "dotenv/config";
import jwt from "jsonwebtoken";
import { Pool } from "pg";
import { Test } from "@nestjs/testing";
import type { INestApplication } from "@nestjs/common";
import request from "supertest";
import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
} from "vitest";
import { AppModule } from "../src/app.module.js";
import { configureApp } from "../src/app.setup.js";
import { CuerpoError } from "../src/common/http-exception.filter.js";
import {
  applyMigrations,
  createTestDatabase,
  seedCatalogo,
} from "./helpers.js";
import {
  CABECERA_CSRF,
  obtenerCsrf,
  type CredencialCsrf,
} from "./helpers.js";

const EVENTO_FECHA_INICIO = "2026-11-21T08:00:00-06:00";
const EVENTO_FECHA_FIN = "2026-11-22T18:00:00-06:00";
const JWT_SECRET_E2E = "secreto-de-prueba-e2e-formato-error";

let app: INestApplication;
let adminPool: Pool;
let testDatabaseUrl: string;
let csrf: CredencialCsrf;
let originalFechaInicio: string | undefined;
let originalFechaFin: string | undefined;
let originalJwtSecret: string | undefined;
let originalDatabaseUrl: string | undefined;

beforeAll(async () => {
  originalDatabaseUrl = process.env.DATABASE_URL;
  originalFechaInicio = process.env.EVENTO_FECHA_INICIO;
  originalFechaFin = process.env.EVENTO_FECHA_FIN;
  originalJwtSecret = process.env.JWT_SECRET;
  process.env.EVENTO_FECHA_INICIO = EVENTO_FECHA_INICIO;
  process.env.EVENTO_FECHA_FIN = EVENTO_FECHA_FIN;
  process.env.JWT_SECRET = JWT_SECRET_E2E;

  const created = await createTestDatabase("formato_error");
  adminPool = created.adminPool;
  testDatabaseUrl = created.databaseUrl;

  await applyMigrations(testDatabaseUrl);
  await seedCatalogo(testDatabaseUrl);

  process.env.DATABASE_URL = testDatabaseUrl;

  const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
  app = moduleRef.createNestApplication();
  configureApp(app);
  await app.init();
  csrf = await obtenerCsrf(app);
}, 180_000);

afterAll(async () => {
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
  if (originalJwtSecret !== undefined) {
    process.env.JWT_SECRET = originalJwtSecret;
  } else {
    delete process.env.JWT_SECRET;
  }
});

describe("Formato uniforme de errores (ExceptionFilter global)", () => {
  it("un error de validación de DTO (email inválido) usa el formato uniforme", async () => {
    const respuesta = await request(app.getHttpServer())
      .post("/api/confirmaciones")
      .set("Cookie", csrf.cookie)
      .set(CABECERA_CSRF, csrf.token)
      .send({
        cliente: {
          nombre: "Cliente",
          apellidos: "De Prueba",
          email: "no-es-un-email",
        },
        fechaHoraEvento: "2026-11-21T10:00:00-06:00",
        itemIds: [],
      })
      .expect(400);

    const cuerpo = respuesta.body as CuerpoError;
    expect(Object.keys(cuerpo).sort()).toEqual([
      "message",
      "path",
      "statusCode",
      "timestamp",
    ]);
    expect(cuerpo.statusCode).toBe(400);
    expect(cuerpo.message).toMatch(/no son válidos/i);
    expect(cuerpo.path).toBe("/api/confirmaciones");
    expect(Number.isNaN(new Date(cuerpo.timestamp).getTime())).toBe(false);
    expect((cuerpo as { error?: unknown }).error).toBeUndefined();
  });

  it("un error 404 (cliente autenticado sin confirmación) usa el formato uniforme", async () => {
    const token = jwt.sign({ sub: "cliente-sin-confirmacion" }, JWT_SECRET_E2E, {
      expiresIn: "1h",
    });

    const respuesta = await request(app.getHttpServer())
      .get("/api/confirmaciones/mia")
      .set("Cookie", `disagro_sesion=${token}`)
      .expect(404);

    const cuerpo = respuesta.body as CuerpoError;
    expect(Object.keys(cuerpo).sort()).toEqual([
      "message",
      "path",
      "statusCode",
      "timestamp",
    ]);
    expect(cuerpo.statusCode).toBe(404);
    expect(cuerpo.message).toMatch(/confirmación/i);
    expect(cuerpo.path).toBe("/api/confirmaciones/mia");
    expect(Number.isNaN(new Date(cuerpo.timestamp).getTime())).toBe(false);
    expect((cuerpo as { error?: unknown }).error).toBeUndefined();
  });

  it("un 404 de ruta inexistente usa el formato uniforme", async () => {
    const respuesta = await request(app.getHttpServer())
      .get("/api/ruta-inexistente")
      .expect(404);

    const cuerpo = respuesta.body as CuerpoError;
    expect(Object.keys(cuerpo).sort()).toEqual([
      "message",
      "path",
      "statusCode",
      "timestamp",
    ]);
    expect(cuerpo.statusCode).toBe(404);
    expect(Number.isNaN(new Date(cuerpo.timestamp).getTime())).toBe(false);
    expect((cuerpo as { error?: unknown }).error).toBeUndefined();
  });
});
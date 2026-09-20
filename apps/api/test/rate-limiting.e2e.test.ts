import "dotenv/config";
import { Pool } from "pg";
import { Test } from "@nestjs/testing";
import type { INestApplication } from "@nestjs/common";
import request from "supertest";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { AppModule } from "../src/app.module.js";
import { configureApp } from "../src/app.setup.js";
import { applyMigrations, createTestDatabase } from "./helpers.js";
import {
  CABECERA_CSRF,
  obtenerCsrf,
  VENTAS_TEST_PASSWORD,
  VENTAS_TEST_USERNAME,
} from "./helpers.js";
import type { CredencialCsrf } from "./helpers.js";
import {
  LIMITE_CONFIRMACIONES_POR_IP,
  VENTANA_CONFIRMACIONES_MS,
} from "../src/confirmaciones/rate-limit.constants.js";
import {
  LIMITE_LOGIN_VENTAS_POR_IP,
  VENTANA_LOGIN_VENTAS_MS,
} from "../src/ventas/ventas.constants.js";

const EVENTO_FECHA_INICIO = "2026-11-21T08:00:00-06:00";
const EVENTO_FECHA_FIN = "2026-11-22T18:00:00-06:00";
const JWT_SECRET_E2E = "secreto-de-prueba-e2e-rate-limit";

const CATALOGO_SEMILLA = [
  { nombre: "Servicio control de plagas", tipo: "SERVICIO", precioActualCentavos: 100000, activo: true },
  { nombre: "Urea granulada", tipo: "PRODUCTO", precioActualCentavos: 34000, activo: true },
] as const;

type ItemSemilla = (typeof CATALOGO_SEMILLA)[number] & { id: string };

let app: INestApplication;
let adminPool: Pool;
let testDatabaseUrl: string;
let prisma: PrismaClient;
let catalogo: Record<string, ItemSemilla>;
let originalDatabaseUrl: string | undefined;
let originalFechaInicio: string | undefined;
let originalFechaFin: string | undefined;
let originalJwtSecret: string | undefined;
let originalVentasUsername: string | undefined;
let originalVentasPassword: string | undefined;
let csrf: CredencialCsrf;

async function seedCatalogo(databaseUrl: string): Promise<Record<string, ItemSemilla>> {
  const semilla = new PrismaClient({ adapter: new PrismaPg({ connectionString: databaseUrl }) });
  await semilla.catalogoItem.createMany({ data: CATALOGO_SEMILLA });
  const items = await semilla.catalogoItem.findMany();
  await semilla.$disconnect();

  return Object.fromEntries(items.map((item) => [item.nombre, { id: item.id, ...item }]));
}

function cuerpoConfirmacion(email: string): {
  cliente: { nombre: string; apellidos: string; email: string };
  fechaHoraEvento: string;
  itemIds: string[];
} {
  return {
    cliente: { nombre: "Cliente", apellidos: "De Prueba", email },
    fechaHoraEvento: "2026-11-21T10:00:00-06:00",
    itemIds: [catalogo["Servicio control de plagas"].id, catalogo["Urea granulada"].id],
  };
}

beforeAll(async () => {
  originalDatabaseUrl = process.env.DATABASE_URL;
  originalFechaInicio = process.env.EVENTO_FECHA_INICIO;
  originalFechaFin = process.env.EVENTO_FECHA_FIN;
  originalJwtSecret = process.env.JWT_SECRET;
  originalVentasUsername = process.env.VENTAS_USERNAME;
  originalVentasPassword = process.env.VENTAS_PASSWORD;
  process.env.EVENTO_FECHA_INICIO = EVENTO_FECHA_INICIO;
  process.env.EVENTO_FECHA_FIN = EVENTO_FECHA_FIN;
  process.env.JWT_SECRET = JWT_SECRET_E2E;
  process.env.VENTAS_USERNAME = VENTAS_TEST_USERNAME;
  process.env.VENTAS_PASSWORD = VENTAS_TEST_PASSWORD;

  const created = await createTestDatabase("rate_limiting");
  adminPool = created.adminPool;
  testDatabaseUrl = created.databaseUrl;

  await applyMigrations(testDatabaseUrl);
  catalogo = await seedCatalogo(testDatabaseUrl);

  process.env.DATABASE_URL = testDatabaseUrl;

  prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: testDatabaseUrl }) });

  const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
  app = moduleRef.createNestApplication();
  configureApp(app);
  await app.init();
  csrf = await obtenerCsrf(app);
}, 180_000);

afterAll(async () => {
  await app?.close();
  await prisma?.$disconnect();
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

describe("POST /api/confirmaciones — rate limiting por IP", () => {
  it(
    `acepta ${LIMITE_CONFIRMACIONES_POR_IP} peticiones por IP en la ventana ` +
      `${VENTANA_CONFIRMACIONES_MS / 60_000} min y responde 429 al exceder el límite`,
    async () => {
      for (let i = 0; i < LIMITE_CONFIRMACIONES_POR_IP; i++) {
        const respuesta = await request(app.getHttpServer())
          .post("/api/confirmaciones")
          .set("Cookie", csrf.cookie)
          .set(CABECERA_CSRF, csrf.token)
          .send(cuerpoConfirmacion(`rate.limit.${i}@example.com`))
          .expect(201);

        expect(respuesta.headers["x-ratelimit-limit"]).toBe(String(LIMITE_CONFIRMACIONES_POR_IP));
        expect(Number(respuesta.headers["x-ratelimit-remaining"])).toBe(
          LIMITE_CONFIRMACIONES_POR_IP - 1 - i,
        );
      }

      const excesoUno = await request(app.getHttpServer())
        .post("/api/confirmaciones")
        .set("Cookie", csrf.cookie)
        .set(CABECERA_CSRF, csrf.token)
        .send(cuerpoConfirmacion("rate.limit.exceso.1@example.com"))
        .expect(429);
      expect(excesoUno.body.statusCode).toBe(429);

      const excesoDos = await request(app.getHttpServer())
        .post("/api/confirmaciones")
        .set("Cookie", csrf.cookie)
        .set(CABECERA_CSRF, csrf.token)
        .send(cuerpoConfirmacion("rate.limit.exceso.2@example.com"))
        .expect(429);
      expect(Number(excesoDos.headers["retry-after"])).toBeGreaterThan(0);

      const clientes = await prisma.cliente.count({
        where: { email: { startsWith: "rate.limit." } },
      });
      expect(clientes).toBe(LIMITE_CONFIRMACIONES_POR_IP);
    },
  );

  it("no aplica el guard a otros endpoints (GET /api/catalogo no se ve limitado)", async () => {
    for (let i = 0; i < 20; i++) {
      await request(app.getHttpServer()).get("/api/catalogo").expect(200);
    }
  });
});

describe("POST /api/ventas/login — rate limiting por IP", () => {
  it(
    `acepta ${LIMITE_LOGIN_VENTAS_POR_IP} intentos por IP en la ventana ` +
      `${VENTANA_LOGIN_VENTAS_MS / 60_000} min y responde 429 al exceder el límite`,
    async () => {
      for (let i = 0; i < LIMITE_LOGIN_VENTAS_POR_IP; i++) {
        const respuesta = await request(app.getHttpServer())
          .post("/api/ventas/login")
          .set("Cookie", csrf.cookie)
          .set(CABECERA_CSRF, csrf.token)
          .send({
            username: VENTAS_TEST_USERNAME,
            password: VENTAS_TEST_PASSWORD,
          })
          .expect(200);

        expect(respuesta.headers["x-ratelimit-limit"]).toBe(
          String(LIMITE_LOGIN_VENTAS_POR_IP),
        );
        expect(Number(respuesta.headers["x-ratelimit-remaining"])).toBe(
          LIMITE_LOGIN_VENTAS_POR_IP - 1 - i,
        );
      }

      const exceso = await request(app.getHttpServer())
        .post("/api/ventas/login")
        .set("Cookie", csrf.cookie)
        .set(CABECERA_CSRF, csrf.token)
        .send({
          username: VENTAS_TEST_USERNAME,
          password: VENTAS_TEST_PASSWORD,
        })
        .expect(429);
      expect(exceso.body.statusCode).toBe(429);
      expect(Number(exceso.headers["retry-after"])).toBeGreaterThan(0);
    },
  );
});

describe("Helmet — cabeceras de seguridad", () => {
  it("incluye las cabeceras de seguridad en las respuestas de la API", async () => {
    const respuesta = await request(app.getHttpServer())
      .get("/api/catalogo")
      .expect(200);

    expect(respuesta.headers["x-content-type-options"]).toBe("nosniff");
    expect(respuesta.headers["x-frame-options"]).toBe("SAMEORIGIN");
    expect(respuesta.headers["referrer-policy"]).toMatch(/no-referrer/);
  });
});
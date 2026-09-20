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
import { COOKIE_CSRF } from "../src/csrf/csrf.constants.js";
import {
  applyMigrations,
  CABECERA_CSRF,
  createTestDatabase,
  seedCatalogo,
  type ItemSemilla,
  VENTAS_TEST_PASSWORD,
  VENTAS_TEST_USERNAME,
} from "./helpers.js";

const EVENTO_FECHA_INICIO = "2026-11-21T08:00:00-06:00";
const EVENTO_FECHA_FIN = "2026-11-22T18:00:00-06:00";
const JWT_SECRET_E2E = "secreto-de-prueba-e2e-csrf";

let app: INestApplication;
let adminPool: Pool;
let testDatabaseUrl: string;
let prisma: PrismaClient;
let catalogo: Record<string, ItemSemilla>;
let originalFechaInicio: string | undefined;
let originalFechaFin: string | undefined;
let originalJwtSecret: string | undefined;
let originalDatabaseUrl: string | undefined;
let originalVentasUsername: string | undefined;
let originalVentasPassword: string | undefined;

function cuerpoConfirmacion(email: string): {
  cliente: { nombre: string; apellidos: string; email: string };
  fechaHoraEvento: string;
  itemIds: string[];
} {
  return {
    cliente: { nombre: "Cliente", apellidos: "CSRF", email },
    fechaHoraEvento: "2026-11-21T10:00:00-06:00",
    itemIds: [catalogo["Servicio control de plagas"].id],
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

  const created = await createTestDatabase("csrf");
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

describe("GET /api/csrf-token — emisión de token de doble cookie", () => {
  it("genera un token aleatorio y lo entrega en una cookie no httpOnly", async () => {
    const respuesta = await request(app.getHttpServer())
      .get("/api/csrf-token")
      .expect(200);

    const token = (respuesta.body as { token: string }).token;
    expect(token).toMatch(/^[0-9a-f]{64}$/);

    const setCookie = respuesta.headers["set-cookie"];
    const cookieCompleta = Array.isArray(setCookie)
      ? setCookie.join("; ")
      : String(setCookie);
    expect(cookieCompleta).toContain(`${COOKIE_CSRF}=${token}`);
    expect(cookieCompleta).not.toMatch(/HttpOnly/i);
    expect(cookieCompleta).toMatch(/Secure/i);
    expect(cookieCompleta).toMatch(/SameSite=Lax/i);
  });
});

describe("POST /api/confirmaciones — protección CSRF", () => {
  it("rechaza con 403 una petición sin la cabecera X-CSRF-Token", async () => {
    const emision = await request(app.getHttpServer())
      .get("/api/csrf-token")
      .expect(200);
    const token = (emision.body as { token: string }).token;

    const sinCabecera = await request(app.getHttpServer())
      .post("/api/confirmaciones")
      .set("Cookie", `${COOKIE_CSRF}=${token}`)
      .send(cuerpoConfirmacion("csrf.sin.cabecera@example.com"))
      .expect(403);
    expect(sinCabecera.body.statusCode).toBe(403);

    const sinCookieNIcabecera = await request(app.getHttpServer())
      .post("/api/confirmaciones")
      .send(cuerpoConfirmacion("csrf.sin.cookie.ni.cabecera@example.com"))
      .expect(403);
    expect(sinCookieNIcabecera.body.statusCode).toBe(403);
  });

  it("rechaza con 403 cuando el token no coincide con la cookie", async () => {
    const emision = await request(app.getHttpServer())
      .get("/api/csrf-token")
      .expect(200);
    const token = (emision.body as { token: string }).token;

    const respuesta = await request(app.getHttpServer())
      .post("/api/confirmaciones")
      .set("Cookie", `${COOKIE_CSRF}=${token}`)
      .set(CABECERA_CSRF, "token-que-no-coincide")
      .send(cuerpoConfirmacion("csrf.descoincidente@example.com"))
      .expect(403);

    expect(respuesta.body).toMatchObject({ statusCode: 403 });

    const clientes = await prisma.cliente.count({
      where: { email: { startsWith: "csrf." } },
    });
    expect(clientes).toBe(0);
  });

  it("acepta la petición cuando la cabecera coincide con la cookie (flujo normal)", async () => {
    const emision = await request(app.getHttpServer())
      .get("/api/csrf-token")
      .expect(200);
    const token = (emision.body as { token: string }).token;

    const respuesta = await request(app.getHttpServer())
      .post("/api/confirmaciones")
      .set("Cookie", `${COOKIE_CSRF}=${token}`)
      .set(CABECERA_CSRF, token)
      .send(cuerpoConfirmacion("csrf.flujo.normal@example.com"))
      .expect(201);

    expect(respuesta.body).toMatchObject({ id: expect.any(String) });
  });
});

describe("POST /api/ventas/login — protección CSRF", () => {
  it("rechaza con 403 una petición sin la cabecera X-CSRF-Token", async () => {
    const respuesta = await request(app.getHttpServer())
      .post("/api/ventas/login")
      .send({ username: VENTAS_TEST_USERNAME, password: VENTAS_TEST_PASSWORD })
      .expect(403);

    expect(respuesta.body).toMatchObject({ statusCode: 403 });
  });

  it("acepta la petición cuando la cabecera coincide con la cookie (flujo normal)", async () => {
    const emision = await request(app.getHttpServer())
      .get("/api/csrf-token")
      .expect(200);
    const token = (emision.body as { token: string }).token;

    const respuesta = await request(app.getHttpServer())
      .post("/api/ventas/login")
      .set("Cookie", `${COOKIE_CSRF}=${token}`)
      .set(CABECERA_CSRF, token)
      .send({ username: VENTAS_TEST_USERNAME, password: VENTAS_TEST_PASSWORD })
      .expect(200);

    expect(respuesta.body).toEqual({ ok: true });
  });
});
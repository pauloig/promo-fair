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
import { COOKIE_VENTAS } from "../src/ventas/ventas.constants.js";
import {
  applyMigrations,
  createTestDatabase,
  seedCatalogo,
  type ItemSemilla,
  VENTAS_TEST_PASSWORD,
  VENTAS_TEST_USERNAME,
} from "./helpers.js";

const EVENTO_FECHA_INICIO = "2026-11-21T08:00:00-06:00";
const EVENTO_FECHA_FIN = "2026-11-22T18:00:00-06:00";
const JWT_SECRET_E2E = "secreto-de-prueba-e2e-ventas";
const COOKIE_CLIENTE = "disagro_sesion";
const EMAIL_VENTAS = VENTAS_TEST_USERNAME;
const CLAVE_VENTAS = VENTAS_TEST_PASSWORD;

const SELECCION_A = ["Servicio control de plagas", "Herbicida glifosato", "Urea granulada"];
const SELECCION_B = [
  "Servicio control de plagas",
  "Urea granulada",
  "Insecticida cipermetrina",
];
const SELECCION_C = ["Urea granulada", "Insecticida cipermetrina"];

const EMAIL_A = "ventas.a@example.com";
const EMAIL_B = "ventas.b@example.com";
const EMAIL_C = "ventas.c@example.com";
const EMAIL_D = "ventas.d@example.com";

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

function cuerpoConfirmacion(
  email: string,
  nombresItems: string[],
  fechaHoraEvento: string,
): {
  cliente: { nombre: string; apellidos: string; email: string };
  fechaHoraEvento: string;
  itemIds: string[];
} {
  return {
    cliente: { nombre: "Cliente", apellidos: "De Prueba", email },
    fechaHoraEvento,
    itemIds: nombresItems.map((nombre) => catalogo[nombre].id),
  };
}

async function crearConfirmacion(
  email: string,
  nombresItems: string[],
  fechaHoraEvento: string,
): Promise<request.Response> {
  return request(app.getHttpServer())
    .post("/api/confirmaciones")
    .send(cuerpoConfirmacion(email, nombresItems, fechaHoraEvento))
    .expect(201);
}

function extraerCookie(respuesta: request.Response, nombre: string): string {
  const setCookie = respuesta.headers["set-cookie"];
  const completa = Array.isArray(setCookie) ? setCookie.join("; ") : String(setCookie);
  return completa.match(new RegExp(`${nombre}=([^;]+)`))![1];
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

  const created = await createTestDatabase("ventas");
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

describe("POST /api/ventas/login", () => {
  it("rechaza con 401 credenciales incorrectas", async () => {
    const respuesta = await request(app.getHttpServer())
      .post("/api/ventas/login")
      .send({ username: EMAIL_VENTAS, password: "clave-incorrecta" })
      .expect(401);

    expect(respuesta.body).toMatchObject({ statusCode: 401 });
    expect(respuesta.headers["set-cookie"]).toBeUndefined();
  });

  it("emite una cookie de sesión propia, distinta a la del cliente", async () => {
    const respuesta = await request(app.getHttpServer())
      .post("/api/ventas/login")
      .send({ username: EMAIL_VENTAS, password: CLAVE_VENTAS })
      .expect(200);

    expect(respuesta.body).toEqual({ ok: true });

    const setCookie = respuesta.headers["set-cookie"];
    expect(setCookie).toBeDefined();
    const cookieCompleta = Array.isArray(setCookie) ? setCookie.join("; ") : String(setCookie);
    expect(cookieCompleta).toContain(`${COOKIE_VENTAS}=`);
    expect(cookieCompleta).not.toContain(`${COOKIE_CLIENTE}=`);
    expect(cookieCompleta).toMatch(/HttpOnly/i);
    expect(cookieCompleta).toMatch(/Secure/i);
    expect(cookieCompleta).toMatch(/SameSite=Lax/i);
    expect(cookieCompleta).toMatch(/Max-Age=43200/i);
  });
});

describe("GET /api/ventas/confirmaciones — protección de sesión", () => {
  it("devuelve 401 sin sesión de Ventas", async () => {
    const respuesta = await request(app.getHttpServer())
      .get("/api/ventas/confirmaciones")
      .expect(401);

    expect(respuesta.body).toMatchObject({ statusCode: 401 });
  });

  it("devuelve 401 con una sesión de cliente válida (independencia total)", async () => {
    const emision = await crearConfirmacion(
      EMAIL_D,
      SELECCION_A,
      "2026-11-21T10:00:00-06:00",
    );
    const cookieCliente = extraerCookie(emision, COOKIE_CLIENTE);

    const respuesta = await request(app.getHttpServer())
      .get("/api/ventas/confirmaciones")
      .set("Cookie", `${COOKIE_CLIENTE}=${cookieCliente}`)
      .expect(401);

    expect(respuesta.body).toMatchObject({ statusCode: 401 });
  });

  it("tampoco permite que la cookie de Ventas acceda a /api/confirmaciones/mia", async () => {
    const login = await request(app.getHttpServer())
      .post("/api/ventas/login")
      .send({ username: EMAIL_VENTAS, password: CLAVE_VENTAS })
      .expect(200);
    const cookieVentas = extraerCookie(login, COOKIE_VENTAS);

    const respuesta = await request(app.getHttpServer())
      .get("/api/confirmaciones/mia")
      .set("Cookie", `${COOKIE_VENTAS}=${cookieVentas}`)
      .expect(401);

    expect(respuesta.body).toMatchObject({ statusCode: 401 });
  });
});

describe("GET /api/ventas/confirmaciones — datos y filtros", () => {
  it("devuelve el listado y el resumen agregado (total y top 5)", async () => {
    const login = await request(app.getHttpServer())
      .post("/api/ventas/login")
      .send({ username: EMAIL_VENTAS, password: CLAVE_VENTAS })
      .expect(200);
    const cookieVentas = extraerCookie(login, COOKIE_VENTAS);

    await crearConfirmacion(EMAIL_A, SELECCION_A, "2026-11-21T09:00:00-06:00");
    await crearConfirmacion(EMAIL_B, SELECCION_B, "2026-11-21T15:00:00-06:00");
    await crearConfirmacion(EMAIL_C, SELECCION_C, "2026-11-22T08:00:00-06:00");

    const respuesta = await request(app.getHttpServer())
      .get("/api/ventas/confirmaciones")
      .set("Cookie", `${COOKIE_VENTAS}=${cookieVentas}`)
      .expect(200);

    expect(respuesta.body.resumen).toEqual({
      totalConfirmaciones: 4,
      topItems: [
        { catalogoItemId: catalogo["Urea granulada"].id, nombre: "Urea granulada", tipo: "PRODUCTO", cantidad: 4 },
        { catalogoItemId: catalogo["Servicio control de plagas"].id, nombre: "Servicio control de plagas", tipo: "SERVICIO", cantidad: 3 },
        { catalogoItemId: catalogo["Herbicida glifosato"].id, nombre: "Herbicida glifosato", tipo: "PRODUCTO", cantidad: 2 },
        { catalogoItemId: catalogo["Insecticida cipermetrina"].id, nombre: "Insecticida cipermetrina", tipo: "PRODUCTO", cantidad: 2 },
      ],
    });

    const emails = respuesta.body.confirmaciones.map(
      (item: { cliente: { email: string } }) => item.cliente.email,
    );
    expect(emails).toEqual([EMAIL_A, EMAIL_D, EMAIL_B, EMAIL_C]);
    expect(respuesta.body.confirmaciones[0].items).toHaveLength(3);
  });

  it("filtra por catalogoItemId", async () => {
    const login = await request(app.getHttpServer())
      .post("/api/ventas/login")
      .send({ username: EMAIL_VENTAS, password: CLAVE_VENTAS })
      .expect(200);
    const cookieVentas = extraerCookie(login, COOKIE_VENTAS);

    const respuesta = await request(app.getHttpServer())
      .get("/api/ventas/confirmaciones")
      .query({ catalogoItemId: catalogo["Herbicida glifosato"].id })
      .set("Cookie", `${COOKIE_VENTAS}=${cookieVentas}`)
      .expect(200);

    expect(respuesta.body.resumen.totalConfirmaciones).toBe(2);
    const emails = respuesta.body.confirmaciones.map(
      (item: { cliente: { email: string } }) => item.cliente.email,
    );
    expect(emails).toEqual([EMAIL_A, EMAIL_D]);
  });

  it("filtra por rango de fecha/hora del evento", async () => {
    const login = await request(app.getHttpServer())
      .post("/api/ventas/login")
      .send({ username: EMAIL_VENTAS, password: CLAVE_VENTAS })
      .expect(200);
    const cookieVentas = extraerCookie(login, COOKIE_VENTAS);

    const respuesta = await request(app.getHttpServer())
      .get("/api/ventas/confirmaciones")
      .query({
        fechaDesde: "2026-11-21T00:00:00-06:00",
        fechaHasta: "2026-11-21T23:59:59-06:00",
      })
      .set("Cookie", `${COOKIE_VENTAS}=${cookieVentas}`)
      .expect(200);

    expect(respuesta.body.resumen.totalConfirmaciones).toBe(3);
    const emails = respuesta.body.confirmaciones.map(
      (item: { cliente: { email: string } }) => item.cliente.email,
    );
    expect(emails).not.toContain(EMAIL_C);
  });

  it("rechaza con 400 filtros malformados o incoherentes", async () => {
    const login = await request(app.getHttpServer())
      .post("/api/ventas/login")
      .send({ username: EMAIL_VENTAS, password: CLAVE_VENTAS })
      .expect(200);
    const cookieVentas = extraerCookie(login, COOKIE_VENTAS);

    await request(app.getHttpServer())
      .get("/api/ventas/confirmaciones")
      .query({ fechaDesde: "no-es-una-fecha" })
      .set("Cookie", `${COOKIE_VENTAS}=${cookieVentas}`)
      .expect(400);

    await request(app.getHttpServer())
      .get("/api/ventas/confirmaciones")
      .query({
        fechaDesde: "2026-11-22T10:00:00-06:00",
        fechaHasta: "2026-11-21T10:00:00-06:00",
      })
      .set("Cookie", `${COOKIE_VENTAS}=${cookieVentas}`)
      .expect(400);
  });
});

describe("GET /api/ventas/confirmaciones/export — CSV", () => {
  it("devuelve un CSV con todas las confirmaciones respetando los mismos filtros", async () => {
    const login = await request(app.getHttpServer())
      .post("/api/ventas/login")
      .send({ username: EMAIL_VENTAS, password: CLAVE_VENTAS })
      .expect(200);
    const cookieVentas = extraerCookie(login, COOKIE_VENTAS);

    const sinFiltros = await request(app.getHttpServer())
      .get("/api/ventas/confirmaciones/export")
      .set("Cookie", `${COOKIE_VENTAS}=${cookieVentas}`)
      .expect(200)
      .expect("Content-Type", /text\/csv/);

    expect(sinFiltros.text.startsWith("\uFEFF")).toBe(true);
    expect(sinFiltros.text).toContain("id,fechaHoraEvento,clienteEmail,clienteNombre");
    for (const email of [EMAIL_A, EMAIL_B, EMAIL_C, EMAIL_D]) {
      expect(sinFiltros.text).toContain(email);
    }

    const filtrado = await request(app.getHttpServer())
      .get("/api/ventas/confirmaciones/export")
      .query({ catalogoItemId: catalogo["Herbicida glifosato"].id })
      .set("Cookie", `${COOKIE_VENTAS}=${cookieVentas}`)
      .expect(200);

    expect(filtrado.text).toContain(EMAIL_A);
    expect(filtrado.text).toContain(EMAIL_D);
    expect(filtrado.text).not.toContain(EMAIL_B);
    expect(filtrado.text).not.toContain(EMAIL_C);
  });

  it("requiere sesión de Ventas para exportar", async () => {
    await request(app.getHttpServer())
      .get("/api/ventas/confirmaciones/export")
      .expect(401);
  });
});
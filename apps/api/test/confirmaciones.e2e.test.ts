import "dotenv/config";
import jwt from "jsonwebtoken";
import { Pool } from "pg";
import { Test } from "@nestjs/testing";
import type { INestApplication } from "@nestjs/common";
import request from "supertest";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { ConfirmacionResumenSchema } from "@disagro/shared";
import type { ConfirmacionResumen } from "@disagro/shared";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { AppModule } from "../src/app.module.js";
import { configureApp } from "../src/app.setup.js";
import { applyMigrations, createTestDatabase } from "./helpers.js";

const EVENTO_FECHA_INICIO = "2026-11-21T08:00:00-06:00";
const EVENTO_FECHA_FIN = "2026-11-22T18:00:00-06:00";
const JWT_SECRET_E2E = "secreto-de-prueba-e2e-confirmaciones";
const COOKIE_DE_SESION = "disagro_sesion";

const CATALOGO_SEMILLA = [
  { nombre: "Servicio control de plagas", tipo: "SERVICIO", precioActualCentavos: 100000, activo: true },
  { nombre: "Análisis de suelo", tipo: "SERVICIO", precioActualCentavos: 50000, activo: true },
  { nombre: "Asesoría de campo", tipo: "SERVICIO", precioActualCentavos: 60000, activo: true },
  { nombre: "Herbicida glifosato", tipo: "PRODUCTO", precioActualCentavos: 46000, activo: true },
  { nombre: "Urea granulada", tipo: "PRODUCTO", precioActualCentavos: 34000, activo: true },
  { nombre: "Insecticida cipermetrina", tipo: "PRODUCTO", precioActualCentavos: 21000, activo: true },
  { nombre: "Fungicida mancozeb", tipo: "PRODUCTO", precioActualCentavos: 9500, activo: true },
  { nombre: "Ítem inactivo oculto", tipo: "PRODUCTO", precioActualCentavos: 1, activo: false },
];

type ItemSemilla = (typeof CATALOGO_SEMILLA)[number] & { id: string };

interface ItemResumenNormalizado {
  tipo: string;
  nombreCongelado: string;
  precioCongeladoCentavos: number;
}

let app: INestApplication;
let adminPool: Pool;
let testDatabaseUrl: string;
let prisma: PrismaClient;
let catalogo: Record<string, ItemSemilla>;
let originalFechaInicio: string | undefined;
let originalFechaFin: string | undefined;
let originalJwtSecret: string | undefined;
let originalDatabaseUrl: string | undefined;

async function seedCatalogo(databaseUrl: string): Promise<Record<string, ItemSemilla>> {
  const semilla = new PrismaClient({ adapter: new PrismaPg({ connectionString: databaseUrl }) });
  await semilla.catalogoItem.createMany({ data: CATALOGO_SEMILLA });
  const items = await semilla.catalogoItem.findMany();
  await semilla.$disconnect();

  return Object.fromEntries(items.map((item) => [item.nombre, { id: item.id, ...item }]));
}

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

function normalizarItems(
  items: {
    tipo: string;
    nombreCongelado: string;
    precioCongeladoCentavos: number;
  }[],
): ItemResumenNormalizado[] {
  return [...items]
    .sort((a, b) => a.nombreCongelado.localeCompare(b.nombreCongelado))
    .map((item) => ({
      tipo: item.tipo,
      nombreCongelado: item.nombreCongelado,
      precioCongeladoCentavos: item.precioCongeladoCentavos,
    }));
}

function resumenEsperadoDeCatalogo(nombres: string[]): ItemResumenNormalizado[] {
  return normalizarItems(
    nombres.map((nombre) => {
      const item = catalogo[nombre];
      return {
        tipo: item.tipo,
        nombreCongelado: item.nombre,
        precioCongeladoCentavos: item.precioActualCentavos,
      };
    }),
  );
}

beforeAll(async () => {
  originalDatabaseUrl = process.env.DATABASE_URL;
  originalFechaInicio = process.env.EVENTO_FECHA_INICIO;
  originalFechaFin = process.env.EVENTO_FECHA_FIN;
  originalJwtSecret = process.env.JWT_SECRET;
  process.env.EVENTO_FECHA_INICIO = EVENTO_FECHA_INICIO;
  process.env.EVENTO_FECHA_FIN = EVENTO_FECHA_FIN;
  process.env.JWT_SECRET = JWT_SECRET_E2E;

  const created = await createTestDatabase("confirmaciones");
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
});

describe("POST /api/confirmaciones — cliente nuevo", () => {
  const email = "cliente.nuevo@example.com";
  const seleccion = [
    "Servicio control de plagas",
    "Análisis de suelo",
    "Herbicida glifosato",
    "Urea granulada",
    "Insecticida cipermetrina",
  ];
  const fechaHoraEvento = "2026-11-21T10:00:00-06:00";

  it("crea cliente y confirmación, congela nombres/precios del catálogo, calcula descuentos y emite cookie de sesión", async () => {
    const respuesta = await request(app.getHttpServer())
      .post("/api/confirmaciones")
      .send(cuerpoConfirmacion(email, seleccion, fechaHoraEvento))
      .expect(201);

    const resumen = respuesta.body as ConfirmacionResumen;
    expect(ConfirmacionResumenSchema.parse(resumen)).toEqual(resumen);
    expect(resumen.id).toEqual(expect.any(String));
    expect(resumen.descuentoServiciosPct).toBe(3);
    expect(resumen.descuentoProductosPct).toBe(3);
    expect(normalizarItems(resumen.items)).toEqual(resumenEsperadoDeCatalogo(seleccion));

    const cliente = await prisma.cliente.findUniqueOrThrow({
      where: { email },
      include: { confirmacion: { include: { items: true, historial: true } } },
    });

    expect(cliente.confirmacion).not.toBeNull();
    const confirmacion = cliente.confirmacion!;
    expect(confirmacion.fechaHoraEvento.getTime()).toBe(new Date(fechaHoraEvento).getTime());
    expect(confirmacion.descuentoServiciosPct).toBe(3);
    expect(confirmacion.descuentoProductosPct).toBe(3);
    expect(confirmacion.items).toHaveLength(5);
    expect(confirmacion.historial).toHaveLength(0);
    expect(normalizarItems(confirmacion.items)).toEqual(resumenEsperadoDeCatalogo(seleccion));

    const setCookie = respuesta.headers["set-cookie"];
    expect(setCookie).toBeDefined();
    const cookieCompleta = Array.isArray(setCookie) ? setCookie.join("; ") : String(setCookie);
    expect(cookieCompleta).toContain(`${COOKIE_DE_SESION}=`);
    expect(cookieCompleta).toMatch(/HttpOnly/i);
    expect(cookieCompleta).toMatch(/Secure/i);
    expect(cookieCompleta).toMatch(/SameSite=Lax/i);
    expect(cookieCompleta).toMatch(/Max-Age=2592000/i);

    const token = cookieCompleta.match(new RegExp(`${COOKIE_DE_SESION}=([^;]+)`))![1];
    const payload = jwt.verify(token, JWT_SECRET_E2E) as { sub?: string };
    expect(payload.sub).toBe(cliente.id);
  });
});

describe("POST /api/confirmaciones — cliente existente", () => {
  const email = "cliente.existente@example.com";
  const primeraSeleccion = [
    "Servicio control de plagas",
    "Análisis de suelo",
    "Herbicida glifosato",
    "Urea granulada",
    "Insecticida cipermetrina",
  ];
  const primeraFecha = "2026-11-21T10:00:00-06:00";

  const segundaSeleccion = [
    "Servicio control de plagas",
    "Asesoría de campo",
    "Herbicida glifosato",
    "Urea granulada",
    "Insecticida cipermetrina",
    "Fungicida mancozeb",
  ];
  const segundaFecha = "2026-11-22T09:00:00-06:00";

  it("una segunda petición con el mismo email actualiza en vez de duplicar y guarda el estado anterior", async () => {
    const primera = await request(app.getHttpServer())
      .post("/api/confirmaciones")
      .send(cuerpoConfirmacion(email, primeraSeleccion, primeraFecha))
      .expect(201);

    const idPrimera = (primera.body as ConfirmacionResumen).id;

    const segunda = await request(app.getHttpServer())
      .post("/api/confirmaciones")
      .send(cuerpoConfirmacion(email, segundaSeleccion, segundaFecha))
      .expect(201);

    expect(ConfirmacionResumenSchema.parse(segunda.body)).toEqual(segunda.body);
    expect(segunda.body).toMatchObject({
      id: idPrimera,
      descuentoServiciosPct: 5,
      descuentoProductosPct: 3,
    });
    expect(segunda.body.items).toHaveLength(6);
    const nombresSegunda = segunda.body.items.map(
      (item: { nombreCongelado: string }) => item.nombreCongelado,
    );
    expect(nombresSegunda).not.toContain("Análisis de suelo");
    expect(nombresSegunda).toContain("Asesoría de campo");
    expect(segunda.body.descuentoServiciosPct).toBe(5);

    const totalConfirmaciones = await prisma.confirmacion.count({
      where: { cliente: { email } },
    });
    expect(totalConfirmaciones).toBe(1);

    const cliente = await prisma.cliente.findUniqueOrThrow({
      where: { email },
      include: { confirmacion: { include: { items: true, historial: true } } },
    });
    const confirmacion = cliente.confirmacion!;

    expect(confirmacion.id).toBe(idPrimera);
    expect(confirmacion.items).toHaveLength(6);
    expect(confirmacion.fechaHoraEvento.getTime()).toBe(new Date(segundaFecha).getTime());
    expect(confirmacion.descuentoServiciosPct).toBe(5);
    expect(confirmacion.descuentoProductosPct).toBe(3);

    const historial = confirmacion.historial;
    expect(historial).toHaveLength(1);
    const estadoAnterior = historial[0].estadoAnterior as {
      fechaHoraEvento: string;
      descuentoServiciosPct: number;
      descuentoProductosPct: number;
      items: ItemResumenNormalizado[];
    };

    expect(estadoAnterior.fechaHoraEvento).toBe(new Date(primeraFecha).toISOString());
    expect(estadoAnterior.descuentoServiciosPct).toBe(3);
    expect(estadoAnterior.descuentoProductosPct).toBe(3);
    expect(normalizarItems(estadoAnterior.items)).toEqual(resumenEsperadoDeCatalogo(primeraSeleccion));
  });
});

describe("POST /api/confirmaciones — validaciones", () => {
  it("rechaza con 400 una fecha/hora fuera del rango configurado del evento", async () => {
    const respuesta = await request(app.getHttpServer())
      .post("/api/confirmaciones")
      .send(
        cuerpoConfirmacion(
          "fuera.rango@example.com",
          ["Herbicida glifosato"],
          "2026-11-20T10:00:00-06:00",
        ),
      )
      .expect(400);

    expect(JSON.stringify(respuesta.body)).toMatch(/rango/i);
  });

  it("rechaza con 400 ítems inexistentes o inactivos", async () => {
    const respuesta = await request(app.getHttpServer())
      .post("/api/confirmaciones")
      .send(
        cuerpoConfirmacion(
          "items.invalidos@example.com",
          ["Herbicida glifosato", "Ítem inactivo oculto"],
          "2026-11-21T10:00:00-06:00",
        ),
      )
      .expect(400);

    expect(JSON.stringify(respuesta.body)).toMatch(/catálogo/i);
  });

  it("rechaza con 400 un body que no cumple ConfirmacionInputSchema", async () => {
    const respuesta = await request(app.getHttpServer())
      .post("/api/confirmaciones")
      .send({
        cliente: { nombre: "Cliente", apellidos: "De Prueba", email: "body.invalido@example.com" },
        fechaHoraEvento: "2026-11-21T10:00:00-06:00",
        itemIds: [],
      })
      .expect(400);

    expect(JSON.stringify(respuesta.body)).toMatch(/no son válidos/i);
  });
});

describe("GET /api/confirmaciones/mia — sesión de cliente", () => {
  const email = "sesion.mia@example.com";
  const seleccion = [
    "Servicio control de plagas",
    "Análisis de suelo",
    "Asesoría de campo",
    "Herbicida glifosato",
    "Urea granulada",
    "Insecticida cipermetrina",
  ];
  const fechaHoraEvento = "2026-11-21T11:30:00-06:00";

  it("responde 401 cuando no hay cookie de sesión", async () => {
    const respuesta = await request(app.getHttpServer())
      .get("/api/confirmaciones/mia")
      .expect(401);

    expect(respuesta.body).toMatchObject({ statusCode: 401 });
  });

  it("devuelve 200 con la confirmación propia usando la cookie emitida al confirmar", async () => {
    const emision = await request(app.getHttpServer())
      .post("/api/confirmaciones")
      .send(cuerpoConfirmacion(email, seleccion, fechaHoraEvento))
      .expect(201);

    const setCookie = emision.headers["set-cookie"];
    const cookieCompleta = Array.isArray(setCookie) ? setCookie.join("; ") : String(setCookie);
    const token = cookieCompleta.match(new RegExp(`${COOKIE_DE_SESION}=([^;]+)`))![1];

    const respuesta = await request(app.getHttpServer())
      .get("/api/confirmaciones/mia")
      .set("Cookie", `${COOKIE_DE_SESION}=${token}`)
      .expect(200);

    expect(respuesta.body).toMatchObject({
      id: emision.body.id,
      fechaHoraEvento: new Date(fechaHoraEvento).toISOString(),
      descuentoServiciosPct: 5,
      descuentoProductosPct: 3,
    });
    expect(respuesta.body.items).toHaveLength(6);
    expect(normalizarItems(respuesta.body.items)).toEqual(resumenEsperadoDeCatalogo(seleccion));
  });

  it("responde 401 cuando la cookie contiene un token inválido", async () => {
    const respuesta = await request(app.getHttpServer())
      .get("/api/confirmaciones/mia")
      .set("Cookie", `${COOKIE_DE_SESION}=token-no-firmado`)
      .expect(401);

    expect(respuesta.body).toMatchObject({ statusCode: 401 });
  });

  it("responde 401 cuando el token está vencido", async () => {
    const vencido = jwt.sign({ sub: "cliente-cualquiera" }, JWT_SECRET_E2E, {
      expiresIn: "-1s",
    });

    const respuesta = await request(app.getHttpServer())
      .get("/api/confirmaciones/mia")
      .set("Cookie", `${COOKIE_DE_SESION}=${vencido}`)
      .expect(401);

    expect(respuesta.body).toMatchObject({ statusCode: 401 });
  });

  it("responde 404 cuando el cliente autenticado no tiene confirmación", async () => {
    const sinConfirmacion = jwt.sign({ sub: "cliente-sin-confirmacion" }, JWT_SECRET_E2E, {
      expiresIn: "1h",
    });

    const respuesta = await request(app.getHttpServer())
      .get("/api/confirmaciones/mia")
      .set("Cookie", `${COOKIE_DE_SESION}=${sinConfirmacion}`)
      .expect(404);

    expect(JSON.stringify(respuesta.body)).toMatch(/confirmación/i);
  });
});
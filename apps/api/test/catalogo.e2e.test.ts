import "dotenv/config";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { Pool } from "pg";
import { Test } from "@nestjs/testing";
import type { INestApplication } from "@nestjs/common";
import request from "supertest";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { AppModule } from "../src/app.module.js";
import { configureApp } from "../src/app.setup.js";

const execFileAsync = promisify(execFile);
const API_DIR = path.resolve(process.cwd());
const PRISMA_BIN = path.join(API_DIR, "node_modules", ".bin", "prisma");

let app: INestApplication;
let adminPool: Pool;
let testDatabaseUrl: string;
let originalDatabaseUrl: string | undefined;

function assertLocalUrl(url: string): void {
  const host = new URL(url).hostname;
  if (!["localhost", "127.0.0.1", "::1"].includes(host)) {
    throw new Error(
      `DATABASE_URL no local para la prueba E2E (host "${host}"). Se exige una base aislada local.`,
    );
  }
}

async function createTestDatabase(): Promise<{ adminPool: Pool; databaseUrl: string }> {
  const adminUrl = process.env.DATABASE_URL;
  if (!adminUrl) throw new Error("DATABASE_URL es requerida para la prueba E2E");

  assertLocalUrl(adminUrl);

  const pool = new Pool({ connectionString: adminUrl });
  const databaseName = `catalogo_e2e_${randomUUID().replaceAll("-", "")}`;
  await pool.query(`CREATE DATABASE "${databaseName}"`);

  const databaseUrl = new URL(adminUrl);
  databaseUrl.pathname = `/${databaseName}`;
  return { adminPool: pool, databaseUrl: databaseUrl.toString() };
}

async function applyMigrations(databaseUrl: string): Promise<void> {
  await execFileAsync(PRISMA_BIN, ["migrate", "deploy"], {
    cwd: API_DIR,
    env: { ...process.env, DATABASE_URL: databaseUrl },
  });
}

async function seedCatalogo(databaseUrl: string): Promise<void> {
  // Precondición acotada: el catálogo no tiene ruta pública de alta (GET-only) desde HTTP.
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: databaseUrl }) });
  await prisma.catalogoItem.createMany({
    data: [
      { tipo: "SERVICIO", nombre: "Diagnóstico integral de suelos", precioActualCentavos: 150000, activo: true },
      { tipo: "PRODUCTO", nombre: "Fertilizante triple 15 (saco 50 kg)", precioActualCentavos: 46000, activo: true },
      { tipo: "PRODUCTO", nombre: "Inactivo oculto del catálogo", precioActualCentavos: 100, activo: false },
    ],
  });
  await prisma.$disconnect();
}

beforeAll(async () => {
  originalDatabaseUrl = process.env.DATABASE_URL;

  const created = await createTestDatabase();
  adminPool = created.adminPool;
  testDatabaseUrl = created.databaseUrl;

  await applyMigrations(testDatabaseUrl);
  await seedCatalogo(testDatabaseUrl);

  process.env.DATABASE_URL = testDatabaseUrl;

  const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
  app = moduleRef.createNestApplication();
  configureApp(app);
  await app.init();
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
});

describe("GET /api/catalogo", () => {
  it("halla por coincidencia parcial insensible a mayúsculas y expone precioCentavos (no precioActualCentavos)", async () => {
    const respuesta = await request(app.getHttpServer())
      .get("/api/catalogo")
      .query({ buscar: "FERtiliZante triple" })
      .expect(200);

    expect(respuesta.body).toEqual([
      expect.objectContaining({
        id: expect.any(String),
        tipo: "PRODUCTO",
        nombre: "Fertilizante triple 15 (saco 50 kg)",
        precioCentavos: 46000,
        activo: true,
      }),
    ]);
    expect(respuesta.body[0]).not.toHaveProperty("precioActualCentavos");
  });

  it("busca ignorando acentos en el término", async () => {
    const respuesta = await request(app.getHttpServer())
      .get("/api/catalogo")
      .query({ buscar: "diagnostico" })
      .expect(200);

    expect(respuesta.body.map((item: { nombre: string }) => item.nombre)).toContain(
      "Diagnóstico integral de suelos",
    );
  });

  it("devuelve lista vacía cuando no hay coincidencias", async () => {
    const respuesta = await request(app.getHttpServer())
      .get("/api/catalogo")
      .query({ buscar: "zzz-no-existe" })
      .expect(200);

    expect(respuesta.body).toEqual([]);
  });

  it("sin parámetro devuelve solo los activos, todos con precioCentavos y ninguno con el campo interno", async () => {
    const respuesta = await request(app.getHttpServer()).get("/api/catalogo").expect(200);

    const nombres = respuesta.body.map((item: { nombre: string }) => item.nombre);
    expect(nombres).toContain("Diagnóstico integral de suelos");
    expect(nombres).not.toContain("Inactivo oculto del catálogo");

    for (const item of respuesta.body) {
      expect(item).toHaveProperty("precioCentavos");
      expect(item).not.toHaveProperty("precioActualCentavos");
      expect(item).toMatchObject({ id: expect.any(String), tipo: expect.any(String), activo: true });
    }
  });
});
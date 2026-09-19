import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const execFileAsync = promisify(execFile);
const API_DIR = path.resolve(process.cwd());
const PRISMA_BIN = path.join(API_DIR, "node_modules", ".bin", "prisma");

export const VENTAS_TEST_USERNAME = "ventas-e2e";
export const VENTAS_TEST_PASSWORD = "clave-ventas-e2e";

export const CATALOGO_SEMILLA = [
  { nombre: "Servicio control de plagas", tipo: "SERVICIO", precioActualCentavos: 100000, activo: true },
  { nombre: "Análisis de suelo", tipo: "SERVICIO", precioActualCentavos: 50000, activo: true },
  { nombre: "Asesoría de campo", tipo: "SERVICIO", precioActualCentavos: 60000, activo: true },
  { nombre: "Herbicida glifosato", tipo: "PRODUCTO", precioActualCentavos: 46000, activo: true },
  { nombre: "Urea granulada", tipo: "PRODUCTO", precioActualCentavos: 34000, activo: true },
  { nombre: "Insecticida cipermetrina", tipo: "PRODUCTO", precioActualCentavos: 21000, activo: true },
  { nombre: "Fungicida mancozeb", tipo: "PRODUCTO", precioActualCentavos: 9500, activo: true },
  { nombre: "Ítem inactivo oculto", tipo: "PRODUCTO", precioActualCentavos: 1, activo: false },
] as const;

export type ItemSemilla = (typeof CATALOGO_SEMILLA)[number] & { id: string };

function assertLocalUrl(url: string): void {
  const host = new URL(url).hostname;
  if (!["localhost", "127.0.0.1", "::1"].includes(host)) {
    throw new Error(
      `DATABASE_URL no local para la prueba E2E (host "${host}"). Se exige una base aislada local.`,
    );
  }
}

export async function createTestDatabase(
  prefijo: string,
): Promise<{ adminPool: Pool; databaseUrl: string }> {
  const adminUrl = process.env.DATABASE_URL;
  if (!adminUrl) throw new Error("DATABASE_URL es requerida para la prueba E2E");

  assertLocalUrl(adminUrl);

  const pool = new Pool({ connectionString: adminUrl });
  const databaseName = `${prefijo}_e2e_${randomUUID().replaceAll("-", "")}`;
  await pool.query(`CREATE DATABASE "${databaseName}"`);

  const databaseUrl = new URL(adminUrl);
  databaseUrl.pathname = `/${databaseName}`;
  return { adminPool: pool, databaseUrl: databaseUrl.toString() };
}

export async function applyMigrations(databaseUrl: string): Promise<void> {
  await execFileAsync(PRISMA_BIN, ["migrate", "deploy"], {
    cwd: API_DIR,
    env: { ...process.env, DATABASE_URL: databaseUrl },
  });
}

export async function seedCatalogo(
  databaseUrl: string,
): Promise<Record<string, ItemSemilla>> {
  const semilla = new PrismaClient({ adapter: new PrismaPg({ connectionString: databaseUrl }) });
  await semilla.catalogoItem.createMany({ data: CATALOGO_SEMILLA });
  const items = await semilla.catalogoItem.findMany();
  await semilla.$disconnect();

  return Object.fromEntries(items.map((item) => [item.nombre, { id: item.id, ...item }]));
}
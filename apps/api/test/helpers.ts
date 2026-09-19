import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { Pool } from "pg";

const execFileAsync = promisify(execFile);
const API_DIR = path.resolve(process.cwd());
const PRISMA_BIN = path.join(API_DIR, "node_modules", ".bin", "prisma");

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
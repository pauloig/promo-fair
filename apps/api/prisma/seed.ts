import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { escribirLog } from "../src/common/json-logger.js";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const SERVICIOS = [
  { nombre: "Diagnóstico integral de suelos", precioActualCentavos: 150000 },
  { nombre: "Análisis foliar de cultivo", precioActualCentavos: 85000 },
  { nombre: "Asesoría técnica en campo", precioActualCentavos: 120000 },
  { nombre: "Plan de fertilización personalizado", precioActualCentavos: 180000 },
  { nombre: "Control fitosanitario integrado", precioActualCentavos: 200000 },
  { nombre: "Calibración de equipo de fumigación", precioActualCentavos: 60000 },
  { nombre: "Monitoreo de plagas y enfermedades", precioActualCentavos: 110000 },
  { nombre: "Capacitación en manejo de cultivo", precioActualCentavos: 95000 },
];

const PRODUCTOS = [
  { nombre: "Fertilizante triple 15 (saco 50 kg)", precioActualCentavos: 46000 },
  { nombre: "Urea granulada (saco 45 kg)", precioActualCentavos: 34000 },
  { nombre: "Herbicida a base de glifosato (galón)", precioActualCentavos: 18000 },
  { nombre: "Insecticida de cipermetrina (litro)", precioActualCentavos: 21000 },
  { nombre: "Fungicida de mancozeb (libra)", precioActualCentavos: 9500 },
  { nombre: "Semilla de maíz híbrido (bolsa 25 kg)", precioActualCentavos: 52000 },
  { nombre: "Bioestimulante orgánico (litro)", precioActualCentavos: 13000 },
  { nombre: "Cal agrícola (saco 40 kg)", precioActualCentavos: 7500 },
];

async function main(): Promise<void> {
  const username = process.env.VENTAS_USERNAME;
  const password = process.env.VENTAS_PASSWORD;

  if (!username || !password) {
    throw new Error("VENTAS_USERNAME y VENTAS_PASSWORD deben estar definidas en el entorno");
  }

  const catalogo = [
    ...SERVICIOS.map((item) => ({ ...item, tipo: "SERVICIO" as const })),
    ...PRODUCTOS.map((item) => ({ ...item, tipo: "PRODUCTO" as const })),
  ];

  await prisma.$transaction([
    prisma.catalogoItem.deleteMany(),
    prisma.catalogoItem.createMany({ data: catalogo }),
  ]);

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.usuarioVentas.upsert({
    where: { username },
    update: { passwordHash },
    create: { username, passwordHash },
  });

  escribirLog("log", "Catálogo sembrado", {
    total: catalogo.length,
    servicios: SERVICIOS.length,
    productos: PRODUCTOS.length,
  });
  escribirLog("log", "Usuario de Ventas listo", { username });
}

main()
  .catch((error) => {
    escribirLog("error", "Falló el sembrado de datos", {
      ...(error instanceof Error ? { error: error.message, stack: error.stack } : {}),
    });
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
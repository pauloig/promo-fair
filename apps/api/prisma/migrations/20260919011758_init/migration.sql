-- CreateEnum
CREATE TYPE "TipoItem" AS ENUM ('SERVICIO', 'PRODUCTO');

-- CreateTable
CREATE TABLE "Cliente" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellidos" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CatalogoItem" (
    "id" TEXT NOT NULL,
    "tipo" "TipoItem" NOT NULL,
    "nombre" TEXT NOT NULL,
    "precioActualCentavos" INTEGER NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "CatalogoItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Confirmacion" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "fechaHoraEvento" TIMESTAMP(3) NOT NULL,
    "descuentoServiciosPct" INTEGER NOT NULL,
    "descuentoProductosPct" INTEGER NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Confirmacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConfirmacionItem" (
    "id" TEXT NOT NULL,
    "confirmacionId" TEXT NOT NULL,
    "catalogoItemId" TEXT NOT NULL,
    "tipo" "TipoItem" NOT NULL,
    "nombreCongelado" TEXT NOT NULL,
    "precioCongeladoCentavos" INTEGER NOT NULL,

    CONSTRAINT "ConfirmacionItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConfirmacionHistorial" (
    "id" TEXT NOT NULL,
    "confirmacionId" TEXT NOT NULL,
    "estadoAnterior" JSONB NOT NULL,
    "editadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConfirmacionHistorial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UsuarioVentas" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,

    CONSTRAINT "UsuarioVentas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_email_key" ON "Cliente"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Confirmacion_clienteId_key" ON "Confirmacion"("clienteId");

-- CreateIndex
CREATE UNIQUE INDEX "UsuarioVentas_username_key" ON "UsuarioVentas"("username");

-- AddForeignKey
ALTER TABLE "Confirmacion" ADD CONSTRAINT "Confirmacion_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConfirmacionItem" ADD CONSTRAINT "ConfirmacionItem_confirmacionId_fkey" FOREIGN KEY ("confirmacionId") REFERENCES "Confirmacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConfirmacionItem" ADD CONSTRAINT "ConfirmacionItem_catalogoItemId_fkey" FOREIGN KEY ("catalogoItemId") REFERENCES "CatalogoItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConfirmacionHistorial" ADD CONSTRAINT "ConfirmacionHistorial_confirmacionId_fkey" FOREIGN KEY ("confirmacionId") REFERENCES "Confirmacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

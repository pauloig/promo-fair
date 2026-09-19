import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module.js";
import { VentasController } from "./ventas.controller.js";
import { VentasLoginGuard } from "./ventas-login.guard.js";
import { VentasService } from "./ventas.service.js";

@Module({
  imports: [PrismaModule],
  controllers: [VentasController],
  providers: [VentasService, VentasLoginGuard],
})
export class VentasModule {}
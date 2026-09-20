import { Module } from "@nestjs/common";
import { ThrottlerModule } from "@nestjs/throttler";
import { PrismaModule } from "../prisma/prisma.module.js";
import { VentasController } from "./ventas.controller.js";
import { VentasLoginGuard } from "./ventas-login.guard.js";
import { VentasService } from "./ventas.service.js";
import {
  LIMITE_LOGIN_VENTAS_POR_IP,
  VENTANA_LOGIN_VENTAS_MS,
} from "./ventas.constants.js";

@Module({
  imports: [
    PrismaModule,
    ThrottlerModule.forRoot({
      throttlers: [
        {
          name: "default",
          limit: LIMITE_LOGIN_VENTAS_POR_IP,
          ttl: VENTANA_LOGIN_VENTAS_MS,
        },
      ],
    }),
  ],
  controllers: [VentasController],
  providers: [VentasService, VentasLoginGuard],
})
export class VentasModule {}
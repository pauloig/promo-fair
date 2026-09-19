import { Module } from "@nestjs/common";
import { ThrottlerModule } from "@nestjs/throttler";
import { EventoModule } from "../evento/evento.module.js";
import { PrismaModule } from "../prisma/prisma.module.js";
import { ConfirmacionesController } from "./confirmaciones.controller.js";
import { ConfirmacionesService } from "./confirmaciones.service.js";
import {
  LIMITE_CONFIRMACIONES_POR_IP,
  VENTANA_CONFIRMACIONES_MS,
} from "./rate-limit.constants.js";
import { SesionClienteGuard } from "./sesion-cliente.guard.js";

@Module({
  imports: [
    PrismaModule,
    EventoModule,
    ThrottlerModule.forRoot({
      throttlers: [
        {
          name: "default",
          limit: LIMITE_CONFIRMACIONES_POR_IP,
          ttl: VENTANA_CONFIRMACIONES_MS,
        },
      ],
    }),
  ],
  controllers: [ConfirmacionesController],
  providers: [ConfirmacionesService, SesionClienteGuard],
})
export class ConfirmacionesModule {}
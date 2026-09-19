import { Module } from "@nestjs/common";
import { EventoModule } from "../evento/evento.module.js";
import { PrismaModule } from "../prisma/prisma.module.js";
import { ConfirmacionesController } from "./confirmaciones.controller.js";
import { ConfirmacionesService } from "./confirmaciones.service.js";

@Module({
  imports: [PrismaModule, EventoModule],
  controllers: [ConfirmacionesController],
  providers: [ConfirmacionesService],
})
export class ConfirmacionesModule {}
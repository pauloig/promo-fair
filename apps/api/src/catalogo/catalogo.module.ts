import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module.js";
import { CatalogoController } from "./catalogo.controller.js";
import { CatalogoService } from "./catalogo.service.js";

@Module({
  imports: [PrismaModule],
  controllers: [CatalogoController],
  providers: [CatalogoService],
})
export class CatalogoModule {}
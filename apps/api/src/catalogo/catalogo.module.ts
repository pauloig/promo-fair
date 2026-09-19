import { Module } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import { CatalogoController } from "./catalogo.controller.js";
import { CatalogoService } from "./catalogo.service.js";

@Module({
  controllers: [CatalogoController],
  providers: [CatalogoService, PrismaService],
})
export class CatalogoModule {}
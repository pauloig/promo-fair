import { Module } from "@nestjs/common";
import { CatalogoModule } from "./catalogo/catalogo.module.js";
import { HealthController } from "./health.controller.js";

@Module({
  imports: [CatalogoModule],
  controllers: [HealthController],
})
export class AppModule {}
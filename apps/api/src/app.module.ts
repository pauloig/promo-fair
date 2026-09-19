import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { CatalogoModule } from "./catalogo/catalogo.module.js";
import eventoConfig from "./evento/evento.config.js";
import { EventoModule } from "./evento/evento.module.js";
import { HealthController } from "./health.controller.js";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [eventoConfig] }),
    CatalogoModule,
    EventoModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
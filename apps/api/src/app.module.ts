import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { CatalogoModule } from "./catalogo/catalogo.module.js";
import { ConfirmacionesModule } from "./confirmaciones/confirmaciones.module.js";
import jwtConfig from "./confirmaciones/jwt.config.js";
import eventoConfig from "./evento/evento.config.js";
import { EventoModule } from "./evento/evento.module.js";
import { HealthController } from "./health.controller.js";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [eventoConfig, jwtConfig] }),
    CatalogoModule,
    EventoModule,
    ConfirmacionesModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
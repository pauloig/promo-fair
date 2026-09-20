import { Module } from "@nestjs/common";
import { APP_FILTER } from "@nestjs/core";
import { ConfigModule } from "@nestjs/config";
import { CatalogoModule } from "./catalogo/catalogo.module.js";
import { ErrorFormateadoFilter } from "./common/http-exception.filter.js";
import { ConfirmacionesModule } from "./confirmaciones/confirmaciones.module.js";
import jwtConfig from "./confirmaciones/jwt.config.js";
import { CsrfModule } from "./csrf/csrf.module.js";
import eventoConfig from "./evento/evento.config.js";
import { EventoModule } from "./evento/evento.module.js";
import { HealthModule } from "./health/health.module.js";
import { VentasModule } from "./ventas/ventas.module.js";
import ventasConfig from "./ventas/ventas.config.js";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [eventoConfig, jwtConfig, ventasConfig],
    }),
    CsrfModule,
    CatalogoModule,
    EventoModule,
    HealthModule,
    ConfirmacionesModule,
    VentasModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: ErrorFormateadoFilter,
    },
  ],
})
export class AppModule {}
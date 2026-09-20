import { ValidationPipe } from "@nestjs/common";
import type { INestApplication } from "@nestjs/common";
import helmet from "helmet";
import { crearLogDePeticiones } from "./common/json-logger.js";

export const GLOBAL_PREFIX = "api";

export function configureApp(app: INestApplication): INestApplication {
  app.use(crearLogDePeticiones());
  app.use(helmet());
  app.setGlobalPrefix(GLOBAL_PREFIX);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );
  return app;
}
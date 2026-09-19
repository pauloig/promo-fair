import { ValidationPipe } from "@nestjs/common";
import type { INestApplication } from "@nestjs/common";

export const GLOBAL_PREFIX = "api";

export function configureApp(app: INestApplication): INestApplication {
  app.setGlobalPrefix(GLOBAL_PREFIX);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );
  return app;
}
import "reflect-metadata";
import "dotenv/config";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module.js";
import { configureApp, GLOBAL_PREFIX } from "./app.setup.js";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  configureApp(app);

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);
  console.log(`API en http://localhost:${port}/${GLOBAL_PREFIX}`);
}

void bootstrap();
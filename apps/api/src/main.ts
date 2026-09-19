import "reflect-metadata";
import "dotenv/config";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module.js";
import { configureApp, GLOBAL_PREFIX } from "./app.setup.js";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: true, credentials: true });
  configureApp(app);

  const documento = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle("API — Plataforma de Confirmación de Asistencia")
      .setDescription(
        "Plataforma que permite a los clientes de DISAGRO confirmar su asistencia a la Feria de " +
          "Promociones, seleccionar servicios y/o productos de su interés y conocer el descuento " +
          "aplicable. Incluye el panel de Ventas para consultar y exportar las confirmaciones.",
      )
      .setVersion("1.0.0")
      .addCookieAuth(
        "disagro_sesion",
        {
          type: "apiKey",
          in: "cookie",
          name: "disagro_sesion",
          description:
            "Sesión de cliente emitida al confirmar asistencia (ADR-003).",
        },
        "disagro_sesion",
      )
      .addCookieAuth(
        "disagro_sesion_ventas",
        {
          type: "apiKey",
          in: "cookie",
          name: "disagro_sesion_ventas",
          description:
            "Sesión del panel de Ventas, independiente de la de cliente (ADR-009).",
        },
        "disagro_sesion_ventas",
      )
      .build(),
  );

  SwaggerModule.setup(`${GLOBAL_PREFIX}/docs`, app, documento);

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);
  console.log(`API en http://localhost:${port}/${GLOBAL_PREFIX}`);
  console.log(`Swagger UI en http://localhost:${port}/${GLOBAL_PREFIX}/docs`);
}

void bootstrap();

import { afterEach, describe, expect, it } from "vitest";
import { corsConfigFactory } from "../src/common/cors.config.js";

const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
});

describe("corsConfigFactory", () => {
  it("en producción no expone orígenes CORS (mismo origen vía Nginx)", () => {
    process.env.NODE_ENV = "production";
    delete process.env.CORS_ORIGINS;
    expect(corsConfigFactory().origenes).toEqual([]);
  });

  it("en desarrollo permite los orígenes locales de Vite", () => {
    process.env.NODE_ENV = "development";
    delete process.env.CORS_ORIGINS;
    expect(corsConfigFactory().origenes).toEqual([
      "http://localhost:5173",
      "http://127.0.0.1:5173",
    ]);
  });

  it("respeta CORS_ORIGINS si está definido, incluso en producción", () => {
    process.env.NODE_ENV = "production";
    process.env.CORS_ORIGINS = "https://disagro.endtoendsolutions.dev";
    expect(corsConfigFactory().origenes).toEqual([
      "https://disagro.endtoendsolutions.dev",
    ]);
  });

  it("ignora orígenes vacíos y espacios", () => {
    process.env.NODE_ENV = "production";
    process.env.CORS_ORIGINS = " , https://a.example, ";
    expect(corsConfigFactory().origenes).toEqual(["https://a.example"]);
  });
});
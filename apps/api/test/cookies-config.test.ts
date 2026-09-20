import { afterEach, describe, expect, it } from "vitest";
import { cookiesConfigFactory } from "../src/common/cookies.config.js";

const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
});

describe("cookiesConfigFactory", () => {
  it("marca Secure=true cuando NODE_ENV es production", () => {
    process.env.NODE_ENV = "production";
    expect(cookiesConfigFactory().secure).toBe(true);
  });

  it("marca Secure=false cuando NODE_ENV no es production", () => {
    process.env.NODE_ENV = "development";
    expect(cookiesConfigFactory().secure).toBe(false);
  });

  it("fuerza Secure=true con COOKIE_SECURE=true aunque NODE_ENV no sea production", () => {
    process.env.NODE_ENV = "development";
    process.env.COOKIE_SECURE = "true";
    expect(cookiesConfigFactory().secure).toBe(true);
  });

  it("fuerza Secure=false con COOKIE_SECURE=false aunque NODE_ENV sea production", () => {
    process.env.NODE_ENV = "production";
    process.env.COOKIE_SECURE = "false";
    expect(cookiesConfigFactory().secure).toBe(false);
  });

  it("usa SameSite=Lax por defecto", () => {
    expect(cookiesConfigFactory().sameSite).toBe("lax");
  });

  it("no fija el dominio de la cookie salvo que COOKIE_DOMAIN esté definido", () => {
    delete process.env.COOKIE_DOMAIN;
    expect(cookiesConfigFactory().domain).toBeUndefined();

    process.env.COOKIE_DOMAIN = ".endtoendsolutions.dev";
    expect(cookiesConfigFactory().domain).toBe(".endtoendsolutions.dev");
  });
});
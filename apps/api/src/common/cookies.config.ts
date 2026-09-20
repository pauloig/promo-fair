import { registerAs } from "@nestjs/config";

export interface CookiesConfig {
  readonly secure: boolean;
  readonly sameSite: "lax" | "strict" | "none";
  readonly domain: string | undefined;
}

export const cookiesConfigFactory = (): Readonly<CookiesConfig> => {
  const secureExplicito = process.env.COOKIE_SECURE;
  const domainExplicito = process.env.COOKIE_DOMAIN;

  const secure =
    secureExplicito === undefined
      ? process.env.NODE_ENV === "production"
      : secureExplicito.trim() === "true";

  const domain =
    domainExplicito === undefined || domainExplicito.trim() === ""
      ? undefined
      : domainExplicito.trim();

  return {
    secure,
    sameSite: "lax",
    domain,
  };
};

const cookiesConfig = registerAs<CookiesConfig>("cookies", cookiesConfigFactory);

export default cookiesConfig;
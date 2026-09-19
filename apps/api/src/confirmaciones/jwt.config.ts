import { registerAs } from "@nestjs/config";

export interface JwtConfig {
  readonly secret: string;
  readonly cookieName: string;
  readonly expiracionDias: number;
}

export const jwtConfigFactory = (): Readonly<JwtConfig> => {
  const secret = process.env.JWT_SECRET;

  if (secret === undefined || secret.trim() === "") {
    throw new Error("La variable de entorno JWT_SECRET es requerida y no está definida");
  }

  return { secret, cookieName: "disagro_sesion", expiracionDias: 30 };
};

const jwtConfig = registerAs<JwtConfig>("jwt", jwtConfigFactory);

export default jwtConfig;
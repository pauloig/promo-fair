import { registerAs } from "@nestjs/config";

export interface VentasConfig {
  readonly usuario: string;
  readonly password: string;
  readonly expiracionHoras: number;
}

export const ventasConfigFactory = (): Readonly<VentasConfig> => {
  const usuario = process.env.VENTAS_USERNAME;
  const password = process.env.VENTAS_PASSWORD;

  if (usuario === undefined || usuario.trim() === "") {
    throw new Error("La variable de entorno VENTAS_USERNAME es requerida y no está definida");
  }
  if (password === undefined || password === "") {
    throw new Error("La variable de entorno VENTAS_PASSWORD es requerida y no está definida");
  }

  return { usuario, password, expiracionHoras: 12 };
};

const ventasConfig = registerAs<VentasConfig>("ventas", ventasConfigFactory);

export default ventasConfig;
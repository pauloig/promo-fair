import { registerAs } from "@nestjs/config";

export interface CorsConfig {
  readonly origenes: string[];
}

const ORIGENES_DESARROLLO = ["http://localhost:5173", "http://127.0.0.1:5173"];

export const corsConfigFactory = (): Readonly<CorsConfig> => {
  const crudo = process.env.CORS_ORIGINS;

  const origenes =
    crudo === undefined || crudo.trim() === ""
      ? process.env.NODE_ENV === "production"
        ? []
        : ORIGENES_DESARROLLO
      : crudo
          .split(",")
          .map((origen) => origen.trim())
          .filter((origen) => origen !== "");

  return { origenes };
};

const corsConfig = registerAs<CorsConfig>("cors", corsConfigFactory);

export default corsConfig;
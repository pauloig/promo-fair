import type { CookieOptions } from "express";
import type { CookiesConfig } from "./cookies.config.js";

export function opcionesCookie(
  cookies: Readonly<CookiesConfig>,
  httpOnly: boolean,
  maxAge: number,
): CookieOptions {
  const opciones: CookieOptions = {
    httpOnly,
    secure: cookies.secure,
    sameSite: cookies.sameSite,
    path: "/",
    maxAge,
  };
  if (cookies.domain !== undefined) {
    opciones.domain = cookies.domain;
  }
  return opciones;
}
import { jwtDecode } from "jwt-decode";
import type { UserRole } from "../constants/shared.constants";

export const getToken = (): string | null => {
  return localStorage.getItem("token");
};

export const removeToken = (): void => {
  localStorage.removeItem("token");
};

export interface DecodedToken {
  uuid: string;
  nombre: string;
  rol: UserRole;
  exp?: number;
  [key: string]: any;
}

export const decodeToken = (): DecodedToken | null => {
  const token = getToken();
  if (!token) return null;
  try {
    return jwtDecode<DecodedToken>(token);
  } catch (err) {
    console.error("Token inválido:", err);
    return null;
  }
};

export const getUserFromToken = (): Pick<
  DecodedToken,
  "uuid" | "nombre" | "rol"
> | null => {
  const decoded = decodeToken();
  if (!decoded) return null;
  return {
    uuid: decoded.uuid,
    nombre: decoded.nombre,
    rol: decoded.rol,
  };
};

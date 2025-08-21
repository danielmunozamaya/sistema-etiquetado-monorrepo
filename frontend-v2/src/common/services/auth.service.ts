import { doPost, doGet } from "./shared.service"
import { i18n } from "../../i18n";

export const login = async (
  nombre: string,
  password: string
): Promise<{ token: string; [key: string]: any }> => {
  const data = await doPost(
    "/usuarios/login",
    { nombre, password },
    {},
    i18n.auth.errorLogin
  );
  const token = data.token;
  localStorage.setItem("token", token);
  return data;
};

export const register = async (
  nombre: string,
  password: string,
  rol: string,
  ruta_impresion_manual: string
): Promise<any> => {
  return await doPost(
    "/usuarios",
    { nombre, password, rol, ruta_impresion_manual },
    {},
    i18n.auth.errorRegister
  );
};

export const getRoles = async (): Promise<any> => {
  return await doGet("/roles", {}, i18n.auth.errorGetRoles);
};

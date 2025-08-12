import { jwtDecode } from "jwt-decode";

export const getToken = () => {
  return localStorage.getItem("token");
};

export const removeToken = () => {
  localStorage.removeItem("token");
};

export const decodeToken = () => {
  const token = getToken();
  if (!token) return null;
  try {
    return jwtDecode(token);
  } catch (err) {
    console.error("Token inválido:", err);
    return null;
  }
};

export const getUserFromToken = () => {
  const decoded = decodeToken();
  if (!decoded) return null;
  return {
    uuid: decoded.uuid,
    nombre: decoded.nombre,
    rol: decoded.rol,
  };
};

import type { AxiosInstance } from "axios";

import axios from "axios";
import { getToken, decodeToken, removeToken } from "./token.service"
import { activateToast } from "../../components/ToastMessage/helpers/ToastMessage.helpers";
import { navigateTo } from "../helpers/router.helper";
import { useRoleStore } from "../stores/role.store";

const PRIMARY_URL = import.meta.env.VITE_API_URL as string;
const SECONDARY_URL = import.meta.env.VITE_API_URL_SECONDARY as string;

// Comprueba si el backend principal está disponible
const checkBackendAvailable = async (): Promise<boolean> => {
  const url = `${PRIMARY_URL}/common/heartbit`;
  try {
    const response = await fetch(url, { cache: "no-store" });
    const data = await response.json();
    return data.alive === true;
  } catch (err: any) {
    console.warn("[Heartbit] Fallo conexión:", err.message);
    return false;
  }
};

// Crea una instancia de axios con baseURL dinámica + interceptor del token
async function createApiWithInterceptor(): Promise<AxiosInstance> {
  const isPrimaryUp = await checkBackendAvailable();
  const baseURL = isPrimaryUp ? PRIMARY_URL : SECONDARY_URL;

  const api = axios.create({
    baseURL,
    timeout: 5000,
    headers: {
      "Content-Type": "application/json",
    },
  });

  api.interceptors.request.use(
    (config) => {
      const token = getToken();

      if (token) {
        const decoded = decodeToken();
        const currentTime = Date.now() / 1000;

        if (decoded?.exp && decoded.exp < currentTime) {
          activateToast({
            message: "Sesión expirada. Por favor, inicie sesión de nuevo",
            type: "danger",
          });
          removeToken();
          useRoleStore.getState().clearRole();
          navigateTo("/login");
        } else {
          config.headers = config.headers || {};
          config.headers.Authorization = `Bearer ${token}`;
          if (decoded?.rol) {
            useRoleStore.setState({ role: decoded.rol });
          }
        }
      }

      return config;
    },
    (error) => Promise.reject(error)
  );

  return api;
}

// Manejo común de errores
const handleError = (error: any, error_message: string): never => {
  const status = error.response?.status;
  const message =
    error.response?.data?.message ||
    "El backend no puede procesar la petición porque la base de datos está sincronizando datos. Por favor, recargue en unos instantes...";

  if (status === 503) {
    activateToast({
      message,
      type: "danger",
    });
    throw new Error(message);
  }

  if (status === 401) {
    removeToken();
    window.location.replace("/login");
    throw new Error("No autorizado");
  }

  console.log(`${error_message}: ${error.message}`);
  throw error.response?.data || new Error(`${error_message}.`);
};

export const doGet = async <T = any>(
  url: string,
  params: Record<string, any> = {},
  error_message?: string
): Promise<T> => {
  try {
    const api = await createApiWithInterceptor();
    const res = await api.get(url, { params });
    return res.data;
  } catch (err) {
    return handleError(err, error_message || "Error en GET");
  }
};

export const doPost = async <T = any>(
  url: string,
  body: Record<string, any> = {},
  params: Record<string, any> = {},
  error_message?: string
): Promise<T> => {
  try {
    const api = await createApiWithInterceptor();
    const res = await api.post(url, body, { params });
    return res.data;
  } catch (err) {
    return handleError(err, error_message || "Error en POST");
  }
};

export const doPatch = async <T = any>(
  url: string,
  body: Record<string, any> = {},
  error_message?: string
): Promise<T> => {
  try {
    const api = await createApiWithInterceptor();
    const res = await api.patch(url, body);
    return res.data;
  } catch (err) {
    return handleError(err, error_message || "Error en PATCH");
  }
};

export const doDelete = async <T = any>(
  url: string,
  error_message?: string
): Promise<T> => {
  try {
    const api = await createApiWithInterceptor();
    const res = await api.delete(url);
    return res.data;
  } catch (err) {
    return handleError(err, error_message || "Error en DELETE");
  }
};

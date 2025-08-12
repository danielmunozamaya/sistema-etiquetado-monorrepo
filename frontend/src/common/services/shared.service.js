import axios from "axios";
import { getToken, decodeToken, removeToken } from "./token.service";
import { activateToast } from "../../components/ToastMessage/helpers/ToastMessage.helpers";
import { navigateTo } from "../helpers/router.helper";
import { useRoleStore } from "../stores/role.store";

const PRIMARY_URL = import.meta.env.VITE_API_URL;
const SECONDARY_URL = import.meta.env.VITE_API_URL_SECONDARY;

// Comprueba si el backend principal está disponible
const checkBackendAvailable = async () => {
  const url = `${PRIMARY_URL}/common/heartbit`;
  // console.log("[Heartbit] Comprobando:", url);
  try {
    const response = await fetch(url, { cache: "no-store" });
    const data = await response.json();
    // console.log("[Heartbit] Respuesta:", data);
    return data.alive === true;
  } catch (err) {
    console.warn("[Heartbit] Fallo conexión:", err.message);
    return false;
  }
};

// Crea una instancia de axios con baseURL dinámica + interceptor del token
async function createApiWithInterceptor() {
  const isPrimaryUp = await checkBackendAvailable();
  // console.log("[API] isPrimaryUp:", isPrimaryUp);
  const baseURL = isPrimaryUp ? PRIMARY_URL : SECONDARY_URL;
  // console.log("[API] baseURL usada:", baseURL);

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
const handleError = (error, error_message) => {
  const status = error.response?.status;
  const message =
    error.response?.data?.message ||
    "El backend no puede procesar la petición porque la base de datos está sincronizando datos. Por favor, recargue en unos instantes...";

  if (status === 503) {
    activateToast({
      message,
      type: "danger",
    });
    return;
  }

  if (status === 401) {
    removeToken();
    window.location.replace = "/login";
    return;
  }

  console.log(`${error_message}: ${error.message}`);
  throw error.response?.data || { message: `${error_message}.` };
};

// Exportaciones que no rompen nada
export const doGet = async (url, params = {}, error_message) => {
  try {
    const api = await createApiWithInterceptor();
    const res = await api.get(url, { params });
    return res.data;
  } catch (err) {
    return handleError(err, error_message);
  }
};

export const doPost = async (url, body = {}, params = {}, error_message) => {
  try {
    const api = await createApiWithInterceptor();
    const res = await api.post(url, body, { params });
    return res.data;
  } catch (err) {
    return handleError(err, error_message);
  }
};

export const doPatch = async (url, body = {}, error_message) => {
  try {
    const api = await createApiWithInterceptor();
    const res = await api.patch(url, body);
    return res.data;
  } catch (err) {
    return handleError(err, error_message);
  }
};

export const doDelete = async (url, error_message) => {
  try {
    const api = await createApiWithInterceptor();
    const res = await api.delete(url);
    return res.data;
  } catch (err) {
    return handleError(err, error_message);
  }
};

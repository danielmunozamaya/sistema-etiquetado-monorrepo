import { doPost } from "../../../../common/services/shared.service";
import { i18n } from "../../../../i18n";

export const crearEan = async (body: Record<string, any>) => {
  return doPost("/ean", body, {}, i18n.modalCrearEan.errorCrearEan);
};

export const fetchProductos = async (
  body: Record<string, any>,
  params?: Record<string, any>
) => {
  return doPost(
    "/productos/query",
    body,
    params,
    i18n.modalCrearEan.errorConsultarProductos
  );
};

export const fetchPresentaciones = async (params?: Record<string, any>) => {
  return doPost(
    "/presentaciones/query",
    {},
    params,
    i18n.modalCrearEan.errorConsultarPresentaciones
  );
};

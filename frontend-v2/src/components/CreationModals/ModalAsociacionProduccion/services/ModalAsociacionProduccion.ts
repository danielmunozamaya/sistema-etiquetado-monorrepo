import {
  doGet,
  doPatch,
  doPost,
} from "../../../../common/services/shared.service";
import { i18n } from "../../../../i18n";

export const fetchCabezales = async (
  body: Record<string, any>,
  params?: Record<string, any>
) => {
  return doPost(
    "/cabezales/query",
    body,
    params,
    i18n.modalAsociacionProduccion.errorConsultarCabezales
  );
};

export const fetchFamilias = async (params?: Record<string, any>) => {
  return doGet(
    "/productos/familias",
    params,
    i18n.modalAsociacionProduccion.errorConsultarFamilias
  );
};

export const fetchProductos = async (
  body: Record<string, any>,
  params?: Record<string, any>
) => {
  return doPost(
    "/productos/query",
    body,
    params,
    i18n.modalAsociacionProduccion.errorConsultarProductos
  );
};

export const fetchPresentaciones = async (params?: Record<string, any>) => {
  return doPost(
    "/presentaciones/query",
    {},
    params,
    i18n.modalAsociacionProduccion.errorConsultarPresentaciones
  );
};

export const fetchEans = async (
  body: Record<string, any>,
  params?: Record<string, any>
) => {
  return doPost(
    "/ean/query",
    body,
    params,
    i18n.modalAsociacionProduccion.errorConsultarEans
  );
};

export const fetchRutas = async (params?: Record<string, any>) => {
  return doGet(
    "/asociacion-produccion/rutas-etiquetas",
    params,
    i18n.modalAsociacionProduccion.errorConsultarRutas
  );
};

export const fetchAsociacionesProduccion = async () => {
  return doGet(
    "/asociacion-produccion",
    {},
    i18n.modalAsociacionProduccion.errorCargarAsociaciones
  );
};

export const updateAsociacionProduccion = async (
  body: Record<string, any>,
  id: string
) => {
  return doPatch(
    `/asociacion-produccion/${id}`,
    body,
    i18n.modalAsociacionProduccion.errorActualizarAsociacion
  );
};

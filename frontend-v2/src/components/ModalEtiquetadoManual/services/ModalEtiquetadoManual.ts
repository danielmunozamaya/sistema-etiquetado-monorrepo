import { doGet, doPost } from "../../../common/services/shared.service";
import { i18n } from "../../../i18n";

export const fetchAsociacionesProduccion = async () => {
  return doGet(
    "/asociacion-produccion",
    {},
    i18n.modalEtiquetadoManual.errorListarAsociacionesProduccion
  );
};

export const fetchCabezales = async (
  body: Record<string, any>,
  params?: Record<string, any>
) => {
  return doPost(
    "/cabezales/query",
    body,
    params,
    i18n.modalEtiquetadoManual.errorConsultarCabezales
  );
};

export const fetchNumeroBidon = async (
  body: Record<string, any>,
  params?: Record<string, any>
) => {
  return doPost(
    "/numero-bidon/v2/query",
    body,
    params,
    i18n.modalEtiquetadoManual.errorConsultarNumeroBidon
  );
};

export const fetchFamilias = async (params?: Record<string, any>) => {
  return doGet(
    "/productos/familias",
    params,
    i18n.modalEtiquetadoManual.errorConsultarFamilias
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
    i18n.modalEtiquetadoManual.errorConsultarProductos
  );
};

export const fetchPresentaciones = async (params?: Record<string, any>) => {
  return doPost(
    "/presentaciones/query",
    {},
    params,
    i18n.modalEtiquetadoManual.errorConsultarPresentaciones
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
    i18n.modalEtiquetadoManual.errorConsultarEans
  );
};

export const postEtiquetaManual = async (body: Record<string, any>) => {
  return doPost(
    "produccion/manual",
    body,
    {},
    i18n.modalEtiquetadoManual.errorImprimirEtiquetas
  );
};

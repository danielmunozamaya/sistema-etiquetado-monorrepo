import { doPost, doDelete } from "../../../common/services/shared.service";
import { i18n } from "../../../i18n";

export const queryPresentaciones = async (body, params) => {
  return doPost(
    "/presentaciones/v2/query",
    body,
    params,
    i18n.verPresentaciones.errorListarPresentaciones
  );
};

export const deletePresentacion = async (id) => {
  return doDelete(
    `/presentaciones/${id}`,
    i18n.verPresentaciones.errorEliminarPresentacion
  );
};

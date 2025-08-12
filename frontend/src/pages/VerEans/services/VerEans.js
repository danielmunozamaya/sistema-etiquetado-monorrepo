import { doDelete, doPost } from "../../../common/services/shared.service";
import { i18n } from "../../../i18n";

export const queryEans = async (body, params) => {
  return doPost("/ean/v2/query", body, params, i18n.verEans.errorListarEans);
};

export const deleteEan = async (id) => {
  return doDelete(`/ean/${id}`, i18n.verEans.errorEliminarEan);
};

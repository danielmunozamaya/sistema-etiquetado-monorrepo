import { doDelete, doPost } from "../../../common/services/shared.service";
import { i18n } from "../../../i18n";

export const queryEans = async (
  body: Record<string, any>,
  params?: Record<string, any>
): Promise<any> => {
  return doPost("/ean/v2/query", body, params, i18n.verEans.errorListarEans);
};

export const deleteEan = async (id: string | number): Promise<any> => {
  return doDelete(`/ean/${id}`, i18n.verEans.errorEliminarEan);
};

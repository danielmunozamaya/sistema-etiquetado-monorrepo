import {
  doPost,
  doGet,
  doPatch,
} from "../../../common/services/shared.service";
import { i18n } from "../../../i18n";

export const filtrarProduccion = async (
  body: Record<string, any>,
  params?: Record<string, any>
): Promise<any> => {
  return doPost(
    "/produccion/filter",
    body,
    params,
    i18n.produccion.errorFiltrarProduccion
  );
};

export const fetchLlenadoras = async (): Promise<any> => {
  return doGet("/llenadoras", {}, i18n.produccion.errorFetchLlenadoras);
};

export const fetchMotivoBajas = async (): Promise<any> => {
  return doGet("/motivo-bajas", {}, i18n.produccion.errorFetchMotivoBajas);
};

export const actualizarProduccion = async (
  id: string | number,
  body: Record<string, any>
): Promise<any> => {
  return doPatch(
    `/produccion/${id}`,
    body,
    i18n.produccion.errorActualizarProduccion
  );
};

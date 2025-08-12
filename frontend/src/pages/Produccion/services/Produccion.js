import {
  doPost,
  doGet,
  doPatch,
} from "../../../common/services/shared.service";
import { i18n } from "../../../i18n";

export const filtrarProduccion = async (body, params) => {
  return doPost(
    "/produccion/filter",
    body,
    params,
    i18n.produccion.errorFiltrarProduccion
  );
};

export const fetchLlenadoras = async () => {
  return doGet("/llenadoras", {}, i18n.produccion.errorFetchLlenadoras);
};

export const fetchMotivoBajas = async () => {
  return doGet("/motivo-bajas", {}, i18n.produccion.errorFetchMotivoBajas);
};

export const actualizarProduccion = async (id, body) => {
  return doPatch(
    `/produccion/${id}`,
    body,
    i18n.produccion.errorActualizarProduccion
  );
};

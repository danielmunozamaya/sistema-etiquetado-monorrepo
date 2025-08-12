import { doGet, doPatch } from "../../../common/services/shared.service";
import { i18n } from "../../../i18n";

export const fetchAsociacionesProduccion = async () => {
  return doGet(
    "/asociacion-produccion",
    {},
    i18n.modalModificarLimites.errorListarAsociacionesProduccion
  );
};

export const updateLimit = async (body, id) => {
  return doPatch(
    `/asociacion-produccion/${id}`,
    body,
    i18n.modalModificarLimites.errorActualizarLimite
  );
};

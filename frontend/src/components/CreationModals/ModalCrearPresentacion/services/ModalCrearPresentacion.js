import { doPost } from "../../../../common/services/shared.service";
import { i18n } from "../../../../i18n";

export const crearPresentacion = async (body) => {
  return doPost(
    "/presentaciones",
    body,
    {},
    i18n.modalCrearPresentacion.errorCrearPresentacion
  );
};

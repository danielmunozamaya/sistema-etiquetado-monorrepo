import { doPost } from "../../../../common/services/shared.service";
import { i18n } from "../../../../i18n";

export const crearLlenadora = async (body) => {
  return doPost(
    "/llenadoras/all",
    body,
    {},
    i18n.modalCrearLlenadora.errorCrearLlenadora
  );
};

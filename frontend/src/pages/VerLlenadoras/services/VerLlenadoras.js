import { doPost, doDelete } from "../../../common/services/shared.service";
import { i18n } from "../../../i18n";

export const queryLlenadoras = async (body, params) => {
  return doPost(
    "/llenadoras/v2/query",
    body,
    params,
    i18n.verLlenadoras.errorListarLlenadoras
  );
};

export const deleteLlenadora = async (id) => {
  return doDelete(
    `/llenadoras/${id}`,
    i18n.verLlenadoras.errorEliminarLlenadora
  );
};

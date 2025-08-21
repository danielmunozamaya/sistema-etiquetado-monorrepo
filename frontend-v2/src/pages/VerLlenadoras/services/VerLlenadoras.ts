import { doPost, doDelete } from "../../../common/services/shared.service";
import { i18n } from "../../../i18n";

export const queryLlenadoras = async (
  body: Record<string, any>,
  params?: Record<string, any>
): Promise<any> => {
  return doPost(
    "/llenadoras/v2/query",
    body,
    params,
    i18n.verLlenadoras.errorListarLlenadoras
  );
};

export const deleteLlenadora = async (id: string | number): Promise<any> => {
  return doDelete(
    `/llenadoras/${id}`,
    i18n.verLlenadoras.errorEliminarLlenadora
  );
};

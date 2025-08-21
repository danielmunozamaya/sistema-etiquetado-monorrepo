import { doPost } from "../../../../common/services/shared.service";
import { i18n } from "../../../../i18n";

export const crearProducto = async (body: Record<string, any>) => {
  return doPost(
    "/productos",
    body,
    {},
    i18n.modalCrearProducto.errorCrearProducto
  );
};

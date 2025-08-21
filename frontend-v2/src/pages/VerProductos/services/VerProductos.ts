import {
  doPost,
  doGet,
  doDelete,
} from "../../../common/services/shared.service";
import { i18n } from "../../../i18n";

export const queryProductos = async (
  body: Record<string, any>,
  params?: Record<string, any>
): Promise<any> => {
  return doPost(
    "/productos/v2/query",
    body,
    params,
    i18n.verProductos.errorListarProductos
  );
};

export const fetchFamilias = async (): Promise<any> => {
  return doGet(
    "/productos/familias",
    {},
    i18n.verProductos.errorListarFamilias
  );
};

export const deleteProducto = async (id: string | number): Promise<any> => {
  return doDelete(`/productos/${id}`, i18n.verProductos.errorEliminarProducto);
};

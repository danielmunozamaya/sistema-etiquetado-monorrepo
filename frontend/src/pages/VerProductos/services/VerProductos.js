import {
  doPost,
  doGet,
  doDelete,
} from "../../../common/services/shared.service";
import { i18n } from "../../../i18n";

export const queryProductos = async (body, params) => {
  return doPost(
    "/productos/v2/query",
    body,
    params,
    i18n.verProductos.errorListarProductos
  );
};

export const fetchFamilias = async () => {
  return doGet("/productos/familias", i18n.verProductos.errorListarFamilias);
};

export const deleteProducto = async (id) => {
  return doDelete(`/productos/${id}`, i18n.verProductos.errorEliminarProducto);
};

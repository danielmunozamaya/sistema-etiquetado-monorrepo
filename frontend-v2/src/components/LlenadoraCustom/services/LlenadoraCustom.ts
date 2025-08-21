import { doPost } from "../../../common/services/shared.service";
import { i18n } from "../../../i18n";

export const postEtiquetaCustom = async (body: Record<string, any>) => {
  return doPost(
    "produccion",
    body,
    {},
    i18n.llenadoraCustom.errorImprimirEtiquetas
  );
};

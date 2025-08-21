import { doGet } from "../../../common/services/shared.service";
import { i18n } from "../../../i18n";

export const getAsociaciones = async (): Promise<any> => {
  return doGet(
    "/asociacion-produccion",
    {},
    i18n.llenadorasSemiauto.errorAsociaciones
  );
};

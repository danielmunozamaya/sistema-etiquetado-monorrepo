import { doGet, doPost } from "../../../common/services/shared.service";
import { i18n } from "../../../i18n";

export const getAsociaciones = async () => {
  return doGet(
    "/asociacion-produccion",
    {},
    i18n.llenadorasAuto.errorAsociaciones
  );
};

export const queryNumeroBidon = async () => {
  return doPost(
    "/numero-bidon/v2/query",
    {
      where: {
        anio: { eq: new Date().getFullYear() },
      },
      order: {
        id_llenadora: "ASC",
        id_cabezal_llenadora: "ASC",
      },
      select: ["id_llenadora", "id_cabezal_llenadora", "numero_bidon"],
    },
    {},
    i18n.llenadorasAuto.errorNumeroBidon
  );
};

export const queryPesos = async () => {
  return doGet(
    "/pesos/v3/query",
    {},
    i18n.llenadorasAuto.errorPesos
  );
};

import type { Llenadora } from "../../common/types/llenadora.types";

import { useState, useEffect } from "react";
import "./LlenadoraAuto.css";
import { i18n } from "../../i18n";

interface LlenadoraAutoProps {
  data: Llenadora;
}

const LlenadoraAuto: React.FC<LlenadoraAutoProps> = ({ data }) => {
  const [cabezalSeleccionado, setCabezalSeleccionado] = useState("A");
  const [indexCabezalSeleccionado, setIndexCabezalSeleccionado] = useState(0);

  const handleCabezalClick = (cabezal: string) => {
    if (!cabezal) return;
    setCabezalSeleccionado(cabezal);
  };

  useEffect(() => {
    if (!data.cabezales) return;
    const index = data.cabezales.findIndex(
      (cabezal) => cabezal.id_cabezal === cabezalSeleccionado
    );
    setIndexCabezalSeleccionado(index);
  }, [cabezalSeleccionado, data.cabezales]);

  return (
    <div className="C-LA1-main">
      {/* Row 1 */}
      <div className="C-LA1-row C-LA1-row-1">
        <span>{data.nombre_llenadora}</span>
      </div>

      {/* Row 2 */}
      <div className="C-LA1-row C-LA1-row-2">
        {i18n.llenadoraAuto.numeroBidonLabel}:{" "}
        {(data.cabezales[0] && data.cabezales[0].numero_bidon) || 1}
      </div>

      {/* Row 3 */}
      <div className="C-LA1-row C-LA1-row-3">
        <div
          className={`C-LA1-subblock ${
            data.cabezales[0].id_cabezal === cabezalSeleccionado
              ? "C-LA1-subblock-active"
              : ""
          }`}
          onClick={() => handleCabezalClick(data.cabezales[0].id_cabezal)}
        >
          <div className="C-LA1-subrow">
            {(data.cabezales[0] && data.cabezales[0].id_cabezal) || "-"}
            {cabezalSeleccionado === "A" && (
              <div className="C-LA1-subblock-selected">
                <i className="bi bi-arrow-right flecha-indicador"></i>
              </div>
            )}
          </div>
          <div className="C-LA1-subrow">
            {(data.cabezales[0] && data.cabezales[0].peso) || "-"}{" "}
            {data.cabezales[0] && data.cabezales[0].peso
              ? i18n.llenadoraAuto.kgLabel
              : ""}
          </div>
        </div>

        <div
          className={`C-LA1-subblock ${
            data.cabezales[1].id_cabezal === cabezalSeleccionado
              ? "C-LA1-subblock-active"
              : ""
          }`}
          onClick={() => handleCabezalClick(data.cabezales[1].id_cabezal)}
        >
          <div className="C-LA1-subrow">
            {(data.cabezales[1] && data.cabezales[1].id_cabezal) || "-"}
            {cabezalSeleccionado === "B" && (
              <div className="C-LA1-subblock-selected">
                <i className="bi bi-arrow-right flecha-indicador"></i>
              </div>
            )}
          </div>
          <div className="C-LA1-subrow">
            {(data.cabezales[1] && data.cabezales[1].peso) || "-"}{" "}
            {data.cabezales[1] && data.cabezales[1].peso
              ? i18n.llenadoraAuto.kgLabel
              : ""}
          </div>
        </div>
      </div>

      {/* Row 4 */}
      <div className="C-LA1-row C-LA1-row-4">
        <div className="C-LA1-column-1">{i18n.llenadoraAuto.productoLabel}</div>
        <div className="C-LA1-vertical-divider bg-color-gray"></div>
        <div className="C-LA1-column-2">
          <span>
            {(data.cabezales[indexCabezalSeleccionado] &&
              data.cabezales[indexCabezalSeleccionado].producto) ||
              i18n.llenadoraAuto.productoNoAsociado}
          </span>
        </div>
      </div>

      {/* Row 5 */}
      <div className="C-LA1-row C-LA1-row-4">
        <div className="C-LA1-column-1">
          {i18n.llenadoraAuto.presentacionLabel}
        </div>
        <div className="C-LA1-vertical-divider bg-color-gray"></div>
        <div className="C-LA1-column-2">
          <span>
            {(data.cabezales[indexCabezalSeleccionado] &&
              data.cabezales[indexCabezalSeleccionado].presentacion) ||
              i18n.llenadoraAuto.presentacionNoAsociada}
          </span>
        </div>
      </div>

      {/* Row 6 */}
      <div className="C-LA1-row C-LA1-row-4">
        <div className="C-LA1-column-1">
          {i18n.llenadoraAuto.codigoEanLabel}
        </div>
        <div className="C-LA1-vertical-divider bg-color-gray"></div>
        <div className="C-LA1-column-2">
          <span>
            {(data.cabezales[indexCabezalSeleccionado] &&
              data.cabezales[indexCabezalSeleccionado].codigo_ean) ||
              i18n.llenadoraAuto.codigoEanNoAsociado}
          </span>
        </div>
      </div>

      {/* Row 7 */}
      <div className="C-LA1-row C-LA1-row-7">
        <div
          className={
            data.cabezales[indexCabezalSeleccionado] &&
            data.cabezales[indexCabezalSeleccionado].comunicacion
              ? "C-LA1-row-7-content bg-color-success"
              : "C-LA1-row-7-content bg-color-danger"
          }
        >
          {/* Vacía de momento */}
        </div>
      </div>
    </div>
  );
};

export default LlenadoraAuto;

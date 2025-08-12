import "./LlenadoraTriple.css";
import { i18n } from "../../i18n";

function LlenadoraTriple({ data }) {
  return (
    <div className="C-LT1-main">
      {/* Fila 1 */}
      <div className="C-LT1-row C-LT1-row-1 px-3">
        <span>{data.nombre_llenadora}</span>
      </div>

      {/* Fila 2 */}
      <div className="C-LT1-row C-LT1-row-2">
        <div className="C-LT1-row-2-col-1">
          {i18n.llenadoraTriple.numeroBidonLabel}:{" "}
          {(data.cabezales[0] && data.cabezales[0].numero_bidon) || 1}
        </div>
        <div className="C-LT1-row-2-col-2-3">
          {i18n.llenadoraTriple.numeroBidonLabel}:{" "}
          {(data.cabezales[2] && data.cabezales[2].numero_bidon) || 1}
        </div>
      </div>

      {/* Fila 3 */}
      <div className="C-LT1-row C-LT1-row-3">
        <div className="C-LT1-row-3-virtual-column">
          <div className="C-LT1-row-3-triple-block">
            <div className="C-LT1-row-3-triple-subrow">
              {(data.cabezales[0] && data.cabezales[0].id_cabezal) || "-"}
            </div>
            <div className="C-LT1-row-3-triple-subrow">
              {(data.cabezales[0] && data.cabezales[0].peso) || "-"}{" "}
              {data.cabezales[0] && data.cabezales[0].peso
                ? i18n.llenadoraTriple.kgLabel
                : ""}
            </div>
          </div>
        </div>
        <div className="C-LT1-row-3-virtual-column">
          <div className="C-LT1-row-3-triple-block">
            <div className="C-LT1-row-3-triple-subrow">
              {(data.cabezales[1] && data.cabezales[1].id_cabezal) || "-"}
            </div>
            <div className="C-LT1-row-3-triple-subrow">
              {(data.cabezales[1] && data.cabezales[1].peso) || "-"}{" "}
              {data.cabezales[1] && data.cabezales[1].peso
                ? i18n.llenadoraTriple.kgLabel
                : ""}
            </div>
          </div>
        </div>
        <div className="C-LT1-row-3-virtual-column">
          <div className="C-LT1-row-3-triple-block">
            <div className="C-LT1-row-3-triple-subrow">
              {(data.cabezales[2] && data.cabezales[2].id_cabezal) || "-"}
            </div>
            <div className="C-LT1-row-3-triple-subrow">
              {(data.cabezales[2] && data.cabezales[2].peso) || "-"}{" "}
              {data.cabezales[2] && data.cabezales[2].peso
                ? i18n.llenadoraTriple.kgLabel
                : ""}
            </div>
          </div>
        </div>
      </div>

      {/* Fila 4 */}
      <div className="C-LT1-row C-LT1-row-4-5-6">
        <div className="C-LT1-row-4-5-6-triple-virtual-col">
          <div className="C-LT1-row-4-5-6-triple-virtual-col-izq">
            {i18n.llenadoraTriple.productoLabel}
          </div>
          <div className="C-LT1-row-4-5-6-vertical-divider bg-color-gray"></div>
          <div className="C-LT1-row-4-5-6-triple-virtual-col-der">
            {(data.cabezales[0] && data.cabezales[0].producto) ||
              i18n.llenadoraTriple.productoNoAsociado}
          </div>
        </div>
        <div className="C-LT1-row-4-5-6-triple-virtual-col">
          <div className="C-LT1-row-4-5-6-triple-virtual-col-izq">
            {i18n.llenadoraTriple.productoLabel}
          </div>
          <div className="C-LT1-row-4-5-6-vertical-divider bg-color-gray"></div>
          <div className="C-LT1-row-4-5-6-triple-virtual-col-der">
            {(data.cabezales[1] && data.cabezales[1].producto) ||
              i18n.llenadoraTriple.productoNoAsociado}
          </div>
        </div>
        <div className="C-LT1-row-4-5-6-triple-virtual-col">
          <div className="C-LT1-row-4-5-6-triple-virtual-col-izq">
            {i18n.llenadoraTriple.productoLabel}
          </div>
          <div className="C-LT1-row-4-5-6-vertical-divider bg-color-gray"></div>
          <div className="C-LT1-row-4-5-6-triple-virtual-col-der">
            {(data.cabezales[2] && data.cabezales[2].producto) ||
              i18n.llenadoraTriple.productoNoAsociado}
          </div>
        </div>
      </div>

      {/* Fila 5 */}
      <div className="C-LT1-row C-LT1-row-4-5-6">
        <div className="C-LT1-row-4-5-6-triple-virtual-col">
          <div className="C-LT1-row-4-5-6-triple-virtual-col-izq">
            {i18n.llenadoraTriple.presentacionLabel}
          </div>
          <div className="C-LT1-row-4-5-6-vertical-divider bg-color-gray"></div>
          <div className="C-LT1-row-4-5-6-triple-virtual-col-der">
            {(data.cabezales[0] && data.cabezales[0].presentacion) ||
              i18n.llenadoraTriple.presentacionNoAsociada}
          </div>
        </div>
        <div className="C-LT1-row-4-5-6-triple-virtual-col">
          <div className="C-LT1-row-4-5-6-triple-virtual-col-izq">
            {i18n.llenadoraTriple.presentacionLabel}
          </div>
          <div className="C-LT1-row-4-5-6-vertical-divider bg-color-gray"></div>
          <div className="C-LT1-row-4-5-6-triple-virtual-col-der">
            {(data.cabezales[1] && data.cabezales[1].presentacion) ||
              i18n.llenadoraTriple.presentacionNoAsociada}
          </div>
        </div>
        <div className="C-LT1-row-4-5-6-triple-virtual-col">
          <div className="C-LT1-row-4-5-6-triple-virtual-col-izq">
            {i18n.llenadoraTriple.presentacionLabel}
          </div>
          <div className="C-LT1-row-4-5-6-vertical-divider bg-color-gray"></div>
          <div className="C-LT1-row-4-5-6-triple-virtual-col-der">
            {(data.cabezales[2] && data.cabezales[2].presentacion) ||
              i18n.llenadoraTriple.presentacionNoAsociada}
          </div>
        </div>
      </div>

      {/* Fila 6 */}
      <div className="C-LT1-row C-LT1-row-4-5-6">
        <div className="C-LT1-row-4-5-6-triple-virtual-col">
          <div className="C-LT1-row-4-5-6-triple-virtual-col-izq">
            {i18n.llenadoraTriple.codigoEanLabel}
          </div>
          <div className="C-LT1-row-4-5-6-vertical-divider bg-color-gray"></div>
          <div className="C-LT1-row-4-5-6-triple-virtual-col-der">
            {(data.cabezales[0] && data.cabezales[0].codigo_ean) ||
              i18n.llenadoraTriple.codigoEanNoAsociado}
          </div>
        </div>
        <div className="C-LT1-row-4-5-6-triple-virtual-col">
          <div className="C-LT1-row-4-5-6-triple-virtual-col-izq">
            {i18n.llenadoraTriple.codigoEanLabel}
          </div>
          <div className="C-LT1-row-4-5-6-vertical-divider bg-color-gray"></div>
          <div className="C-LT1-row-4-5-6-triple-virtual-col-der">
            {(data.cabezales[1] && data.cabezales[1].codigo_ean) ||
              i18n.llenadoraTriple.codigoEanNoAsociado}
          </div>
        </div>
        <div className="C-LT1-row-4-5-6-triple-virtual-col">
          <div className="C-LT1-row-4-5-6-triple-virtual-col-izq">
            {i18n.llenadoraTriple.codigoEanLabel}
          </div>
          <div className="C-LT1-row-4-5-6-vertical-divider bg-color-gray"></div>
          <div className="C-LT1-row-4-5-6-triple-virtual-col-der">
            {(data.cabezales[2] && data.cabezales[2].codigo_ean) ||
              i18n.llenadoraTriple.codigoEanNoAsociado}
          </div>
        </div>
      </div>

      {/* Fila 7 */}
      <div className="C-LT1-row C-LT1-row-7">
        <div
          className={
            data.cabezales[0] && data.cabezales[0].comunicacion
              ? "C-LT1-row-7-col bg-color-success"
              : "C-LT1-row-7-col bg-color-danger"
          }
        ></div>
        <div
          className={
            data.cabezales[1] && data.cabezales[1].comunicacion
              ? "C-LT1-row-7-col bg-color-success"
              : "C-LT1-row-7-col bg-color-danger"
          }
        ></div>
        <div
          className={
            data.cabezales[2] && data.cabezales[2].comunicacion
              ? "C-LT1-row-7-col bg-color-success"
              : "C-LT1-row-7-col bg-color-danger"
          }
        ></div>
      </div>
    </div>
  );
}

export default LlenadoraTriple;

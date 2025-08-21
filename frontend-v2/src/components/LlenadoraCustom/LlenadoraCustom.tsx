import "./LlenadoraCustom.css";
import { useState, useRef, useEffect } from "react";
import { postEtiquetaCustom } from "./services/LlenadoraCustom";
import { activateToast } from "../ToastMessage/helpers/ToastMessage.helpers";
import CustommizeLlenadoraModal from "../CustomizeLlenadoraModal/CustomizeLlenadoraModal";
// import EtiquetaCanvas from "../EtiquetaCanvas/EtiquetaCanvas";
import { i18n } from "../../i18n";

interface Cabezal {
  id_cabezal: string;
  producto?: string;
  presentacion?: string;
  numero_bidon?: number;
}

type Config = Record<string, string>;

interface LlenadoraCustomProps {
  nombre_llenadora: string;
  id_llenadora: string;
  cabezales: Cabezal[];
  title_class_name?: string;
  tipo_etiqueta: string;
}

const LlenadoraCustom: React.FC<LlenadoraCustomProps> = ({
  nombre_llenadora,
  id_llenadora,
  cabezales,
  title_class_name,
  tipo_etiqueta,
}) => {
  const [cabezalSeleccionado, setCabezalSeleccionado] = useState("A");
  const [indexCabezalSeleccionado, setIndexCabezalSeleccionado] = useState(0);
  const [unidades, setUnidades] = useState(1);
  const [config, setConfig] = useState<Config>({
    titulo_1: "",
    valor_1: "",
    titulo_2: "",
    valor_2: "",
  });
  const modalRef = useRef<HTMLDivElement>(null);
  // const [datosEtiqueta, setDatosEtiqueta] = useState<any[]>([]);

  const formFieldsArray = [
    { id: "titulo_1", label: i18n.llenadoraCustom.titulo1Label },
    { id: "valor_1", label: i18n.llenadoraCustom.valor1Label },
    { id: "titulo_2", label: i18n.llenadoraCustom.titulo2Label },
    { id: "valor_2", label: i18n.llenadoraCustom.valor2Label },
  ];

  const handleImprimir = async () => {
    if (
      (config.titulo_1.length && !config.valor_1.length) ||
      (!config.titulo_1.length && config.valor_1.length)
    ) {
      activateToast({
        message: i18n.llenadoraCustom.titulo1Valor1DependenciaInvalid,
        type: "danger",
      });
      return;
    }

    if (
      (config.titulo_2.length && !config.valor_2.length) ||
      (!config.titulo_2.length && config.valor_2.length)
    ) {
      activateToast({
        message: i18n.llenadoraCustom.titulo2Valor2DependenciaInvalid,
        type: "danger",
      });
      return;
    }

    const serviceBody = setPostBody();
    try {
      await postEtiquetaCustom(serviceBody);
      // const data = { ... };
      // setDatosEtiqueta([{ ...data }, { ...data }]);
      activateToast({
        message: i18n.llenadoraCustom.successImprimirEtiquetas,
        type: "success",
      });
    } catch (error: any) {
      activateToast({
        message: error.message || i18n.llenadoraCustom.errorImprimirEtiquetas,
        type: "danger",
      });
    }
  };

  const setPostBody = () => {
    const numero_items = Math.max(1, Math.min(unidades, 20));

    let body: Record<string, any> = {
      tipo_etiqueta,
      id_llenadora,
      id_cabezal_llenadora: cabezalSeleccionado,
      numero_items,
    };

    if (config.titulo_1) body.titulo_1 = config.titulo_1;
    if (config.valor_1) body.valor_1 = config.valor_1;
    if (config.titulo_2) body.titulo_2 = config.titulo_2;
    if (config.valor_2) body.valor_2 = config.valor_2;

    return body;
  };

  const handleBorrarCampos = () => {
    setConfig({
      titulo_1: "",
      valor_1: "",
      titulo_2: "",
      valor_2: "",
    });
  };

  const handleSetConfiguracion = () => {
    cerrarModalConfiguracion();
  };

  const abrirModalConfiguracion = () => {
    const modal = new window.bootstrap.Modal(modalRef.current);
    modal.show();
  };

  const cerrarModalConfiguracion = () => {
    const modal = window.bootstrap.Modal.getInstance(modalRef.current);
    modal.hide();
  };

  useEffect(() => {
    if (!cabezales) return;
    const indexCabezalSeleccionado = cabezales.findIndex(
      (cabezal) => cabezal.id_cabezal === cabezalSeleccionado
    );
    setIndexCabezalSeleccionado(indexCabezalSeleccionado);
  }, [cabezalSeleccionado, cabezales]);

  return (
    <div className="C-LC1-main">
      {/* Row 1: Título */}
      <div className={`C-LC1-row C-LC1-row-1 ${title_class_name || ""}`}>
        {nombre_llenadora}
      </div>

      {/* Row 2: Producto */}
      <div className="C-LC1-row C-LC1-row-form">
        <div className="C-LC1-row-form-label">
          {i18n.llenadoraCustom.productoLabel}
        </div>
        <div className="C-LC1-form-vertical-divider bg-color-gray"></div>
        <div className="C-LC1-form-input">
          {(cabezales &&
            cabezales[indexCabezalSeleccionado] &&
            cabezales[indexCabezalSeleccionado].producto) ||
            i18n.llenadoraCustom.productoNoAsociado}
        </div>
      </div>

      {/* Row 3: Presentación */}
      <div className="C-LC1-row C-LC1-row-form">
        <div className="C-LC1-row-form-label">
          {i18n.llenadoraCustom.presentacionLabel}
        </div>
        <div className="C-LC1-form-vertical-divider bg-color-gray"></div>
        <div className="C-LC1-form-input">
          {(cabezales &&
            cabezales[indexCabezalSeleccionado] &&
            cabezales[indexCabezalSeleccionado].presentacion) ||
            i18n.llenadoraCustom.presentacionNoAsociada}
        </div>
      </div>

      {/* Row 4: Cabezal */}
      <div className="C-LC1-row C-LC1-row-form">
        <div className="C-LC1-row-form-label">
          {i18n.llenadoraCustom.cabezalLabel}
        </div>
        <div className="C-LC1-form-vertical-divider bg-color-gray"></div>
        <div className="C-LC1-form-input">
          <select
            className="C-LC1-form-select-row-4 form-select form-select-sm"
            value={cabezalSeleccionado}
            onChange={(e) => setCabezalSeleccionado(e.target.value)}
          >
            {cabezales &&
              cabezales.map((c, i) => (
                <option key={i} value={c.id_cabezal}>
                  {c.id_cabezal}
                </option>
              ))}
          </select>
        </div>
      </div>

      {/* Row 5: Unidades */}
      <div className="C-LC1-row C-LC1-row-form">
        <div className="C-LC1-row-form-label">
          {i18n.llenadoraCustom.unidadesLabel}
        </div>
        <div className="C-LC1-form-vertical-divider bg-color-gray"></div>
        <div className="C-LC1-form-input">
          <input
            type="number"
            className="C-LC1-form-input-row-5 form-control form-control-sm"
            value={unidades}
            min={1}
            max={20}
            onChange={(e) => setUnidades(Number(e.target.value))}
          />
        </div>
      </div>

      {/* Row 6: Nº de bidón */}
      <div className="C-LC1-row C-LC1-row-form">
        <div className="C-LC1-row-form-label">
          {i18n.llenadoraCustom.numeroBidonLabel}
        </div>
        <div className="C-LC1-form-vertical-divider bg-color-gray"></div>
        <div className="C-LC1-form-input">
          {(cabezales && cabezales[0]?.numero_bidon) ?? "1"}
        </div>
      </div>

      {/* Row 7: Botones Configurar + Imprimir */}
      <div className="C-LC1-row C-LC1-row-7">
        <div className="C-LC1-row-7-button">
          <button
            className="btn btn-sm btn-light-gray"
            onClick={abrirModalConfiguracion}
          >
            {i18n.llenadoraCustom.configurarBtn}
          </button>
        </div>
        <div className="C-LC1-row-7-button">
          <button className="btn btn-sm btn-warning" onClick={handleImprimir}>
            {i18n.llenadoraCustom.imprimirBtn}
          </button>
        </div>
      </div>

      {/* Canvas para etiquetado manual */}
      {/*datosEtiqueta.length > 0 && (
        <EtiquetaCanvas
          key={Date.now()}
          data={datosEtiqueta}
          onFinish={() => setDatosEtiqueta([])}
        />
      )*/}

      {/* Modal de Configuración */}
      <CustommizeLlenadoraModal
        nombre_llenadora={nombre_llenadora}
        formFieldsValue={config}
        setFormFieldsFn={setConfig}
        handleEraseFieldsFn={handleBorrarCampos}
        handleSetConfigurationFn={handleSetConfiguracion}
        closeModalFn={cerrarModalConfiguracion}
        formFieldsArray={formFieldsArray}
        modalRef={modalRef}
      />
    </div>
  );
};

export default LlenadoraCustom;

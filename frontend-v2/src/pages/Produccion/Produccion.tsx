import { useState, useEffect, useRef } from "react";
import "./Produccion.css";
import { Button, Modal } from "react-bootstrap";
import {
  filtrarProduccion,
  fetchLlenadoras,
  fetchMotivoBajas,
  actualizarProduccion,
} from "./services/Produccion";
import { activateToast } from "../../components/ToastMessage/helpers/ToastMessage.helpers";
import HorizontalScrollTable from "../../components/HorizontalScrollTable/HorizontalScrollTable";
import Paginator from "../../components/Paginator/Paginator";
import { TABLE_ROWS_LIMIT } from "../../common/constants/shared.constants";
import { i18n } from "../../i18n";

// Puedes definir estos tipos en un archivo común si lo prefieres
interface Llenadora {
  id_llenadora: string;
  nombre_llenadora: string;
}

interface MotivoBaja {
  codigo_baja: string;
  nombre_baja: string;
}

interface ProduccionRegistro {
  [key: string]: any;
}

const columnasDisponibles = [
  "Nº_de_ítem",
  "tipo_etiqueta",
  "no_bidon",
  "no_matricula",
  "no_lote",
  "sscc",
  "id_llenadora",
  "id_cabezal_llenadora",
  "id_producto",
  "familia_producto",
  "codigo_ean",
  "fecha_produccion",
  "hora_produccion",
  "fecha_caducidad",
  "code",
  "peso_neto_real",
  "peso_neto_etiqueta",
  "peso_bruto_etiqueta",
  "titulo_1",
  "valor_1",
  "titulo_2",
  "valor_2",
  "estado",
  "motivo_baja",
  "baja_fecha",
  "baja_usuario",
  "registrado",
  "fecha_registro",
];

const columnasBeautify: Record<string, string> = {
  Nº_de_ítem: i18n.produccion.colItem,
  tipo_etiqueta: i18n.produccion.colTipoEtiqueta,
  no_bidon: i18n.produccion.colNoBidon,
  no_matricula: i18n.produccion.colNoMatricula,
  no_lote: i18n.produccion.colNoLote,
  sscc: i18n.produccion.colSSCC,
  id_llenadora: i18n.produccion.colIdLlenadora,
  id_cabezal_llenadora: i18n.produccion.colIdCabezal,
  id_producto: i18n.produccion.colIdProducto,
  familia_producto: i18n.produccion.colFamiliaProducto,
  codigo_ean: i18n.produccion.colCodigoEAN,
  fecha_produccion: i18n.produccion.colFechaProduccion,
  hora_produccion: i18n.produccion.colHoraProduccion,
  fecha_caducidad: i18n.produccion.colFechaCaducidad,
  code: i18n.produccion.colCode,
  peso_neto_real: i18n.produccion.colPesoNetoReal,
  peso_neto_etiqueta: i18n.produccion.colPesoNetoEtiqueta,
  peso_bruto_etiqueta: i18n.produccion.colPesoBrutoEtiqueta,
  titulo_1: i18n.produccion.colTitulo1,
  valor_1: i18n.produccion.colValor1,
  titulo_2: i18n.produccion.colTitulo2,
  valor_2: i18n.produccion.colValor2,
  estado: i18n.produccion.colEstado,
  motivo_baja: i18n.produccion.colMotivoBaja,
  baja_fecha: i18n.produccion.colBajaFecha,
  baja_usuario: i18n.produccion.colBajaUsuario,
  registrado: i18n.produccion.colRegistrado,
  fecha_registro: i18n.produccion.colFechaRegistro,
};

const TipoEtiquetaEnum: Record<number, string> = {
  1: i18n.produccion.tipoEtiquetaAuto,
  2: i18n.produccion.tipoEtiquetaSemiauto,
  3: i18n.produccion.tipoEtiquetaManual,
};

const beautify = (text: string) => {
  return columnasBeautify[text];
};

const horaValida = (hora: string) => {
  if (!hora) return true;
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(hora);
};

const pipeFecha = (fecha: string) => {
  if (fecha) return fecha.split("-").reverse().join("/");
};

const pipeRegistroValue = (
  col: string,
  registro: ProduccionRegistro,
  index: number,
  offset: number
) => {
  if (col === "Nº_de_ítem") return index + offset + 1;
  if (col === "fecha_produccion" || col === "fecha_caducidad")
    return pipeFecha(registro[col]);
  if (col === "registrado" || col === "estado") return String(registro[col]);
  if (col === "baja_fecha" && registro[col])
    return pipeFecha(registro[col].split("T")[0]);
  if (col === "motivo_baja" && registro.motivoBaja) {
    return registro.motivoBaja.nombre_baja;
  }
  if (col === "baja_usuario" && registro.bajaUsuario) {
    return registro.bajaUsuario.nombre;
  }
  if (col === "tipo_etiqueta") return TipoEtiquetaEnum[registro[col]];
  if (col === "hora_produccion") {
    const splitted = registro[col]?.split(":");
    const horas = splitted?.[0];
    const mins = splitted?.[1];
    return `${horas}:${mins}`;
  }
  if (col === "code") {
    return registro[col]?.toString().padStart(3, "0");
  }
  if (
    col === "peso_neto_real" ||
    col === "peso_neto_etiqueta" ||
    col === "peso_bruto_etiqueta"
  ) {
    if (!registro[col]) return "0.00";
  }
  return registro[col];
};

const Produccion: React.FC = () => {
  const aplicarFiltrosBtnRef = useRef<HTMLButtonElement>(null);
  const [visibles, setVisibles] = useState<string[]>(columnasDisponibles);
  const [showModal, setShowModal] = useState(false);
  const [showFiltros, setShowFiltros] = useState(false);
  const [limit] = useState(TABLE_ROWS_LIMIT);
  const [offset, setOffset] = useState(0);
  const [paginatedResponse] = useState(1);
  const [lastOffset, setLastOffset] = useState<number | null>(null);
  const [nextOffset, setNextOffset] = useState<number | null>(null);
  const [actualPage, setActualPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [registros, setRegistros] = useState<ProduccionRegistro[]>([]);
  const [llenadoras, setLlenadoras] = useState<Llenadora[]>([]);
  const [filtrosParseados, setFiltrosParseados] = useState<Record<string, any>>(
    {}
  );
  const [produccionToDelete, setProduccionToDelete] =
    useState<ProduccionRegistro | null>(null);
  const [productionToDeleteNoItem, setProductionToDeleteNoItem] = useState<
    number | null
  >(null);
  const [motivosBaja, setMotivosBaja] = useState<MotivoBaja[]>([]);
  const [motivoSeleccionado, setMotivoSeleccionado] =
    useState<MotivoBaja | null>(null);

  const [filtros, setFiltros] = useState({
    llenadora: "",
    cabezal: "",
    baja: "",
    registrado: "",
    tipoEtiqueta: "",
    desde: "",
    hasta: "",
    horaDesde: i18n.produccion.horaPlaceholder,
    horaHasta: i18n.produccion.horaPlaceholder,
  });

  const toggleColumna = (col: string) => {
    if (col === "Nº_de_ítem") return;
    setVisibles((prev) => {
      if (prev.includes(col)) {
        return prev.filter((c) => c !== col);
      } else {
        const indexOriginal = columnasDisponibles.indexOf(col);
        const newVisibles = [...prev];
        newVisibles.splice(indexOriginal, 0, col);
        return newVisibles;
      }
    });
  };

  const handleAnterior = () => {
    if (lastOffset === null) return;
    fetchAndSetProduccion(filtrosParseados, lastOffset);
  };

  const handleSiguiente = () => {
    if (nextOffset === null) return;
    fetchAndSetProduccion(filtrosParseados, nextOffset);
  };

  const goToPage = (pageNumber: number) => {
    const goToPageOffset = pageNumber * limit - limit;
    fetchAndSetProduccion(filtrosParseados, goToPageOffset);
  };

  const handleFiltroChange = (campo: string, valor: string) => {
    setFiltros((prev) => ({ ...prev, [campo]: valor }));
  };

  const resetFiltros = () => {
    setFiltros({
      llenadora: "",
      cabezal: "",
      baja: "",
      registrado: "",
      tipoEtiqueta: "",
      desde: "",
      hasta: "",
      horaDesde: i18n.produccion.horaPlaceholder,
      horaHasta: i18n.produccion.horaPlaceholder,
    });
    setFiltrosParseados({});
  };

  const fetchAndSetProduccion = async (
    body: Record<string, any>,
    newOffset = 0
  ) => {
    try {
      const data = await filtrarProduccion(body, {
        limit,
        offset: newOffset,
        paginated_response: paginatedResponse,
      });

      setOffset(newOffset);
      setRegistros(data.data || []);
      setActualPage(data.actualPage || 1);
      setTotalPages(data.totalPages || 1);
      setLastOffset(data.lastOffset);
      setNextOffset(data.nextOffset);
    } catch (error: any) {
      console.error("Error al cargar producción:", error.message);
    }
  };

  const handleAplicarFiltros = () => {
    const { horaDesde, horaHasta } = filtros;

    const errorHoraDesde =
      horaDesde &&
      horaDesde !== i18n.produccion.horaPlaceholder &&
      !horaValida(horaDesde);
    const errorHoraHasta =
      horaHasta &&
      horaHasta !== i18n.produccion.horaPlaceholder &&
      !horaValida(horaHasta);

    if (errorHoraDesde || errorHoraHasta) return;

    const body: Record<string, any> = {};

    if (filtros.llenadora) body.id_llenadora = filtros.llenadora;
    if (filtros.cabezal) body.id_cabezal_llenadora = filtros.cabezal;

    if (filtros.baja === "true") body.estado = 0;
    else if (filtros.baja === "false") body.estado = 1;

    if (filtros.registrado === "true") body.registrado = 1;
    else if (filtros.registrado === "false") body.registrado = 0;

    if (filtros.tipoEtiqueta === i18n.produccion.tipoEtiquetaAuto)
      body.tipo_etiqueta = 1;
    else if (filtros.tipoEtiqueta === i18n.produccion.tipoEtiquetaSemiauto)
      body.tipo_etiqueta = 2;
    else if (filtros.tipoEtiqueta === i18n.produccion.tipoEtiquetaManual)
      body.tipo_etiqueta = 3;

    if (filtros.desde && filtros.hasta && filtros.desde > filtros.hasta) {
      activateToast({
        message: i18n.produccion.errorFechaLimite,
        type: "danger",
      });
      return;
    }

    if (filtros.desde) body.fecha_desde = filtros.desde;
    if (filtros.hasta) body.fecha_hasta = filtros.hasta;
    if (horaValida(filtros.horaDesde)) body.hora_desde = filtros.horaDesde;
    if (horaValida(filtros.horaHasta)) body.hora_hasta = filtros.horaHasta;

    setFiltrosParseados(body);
    setShowFiltros(false);
    fetchAndSetProduccion(body, 0);
  };

  const handleRowClick = async (
    registro: ProduccionRegistro,
    no_item: number
  ) => {
    setProduccionToDelete(registro);
    setProductionToDeleteNoItem(no_item);
    const motivos = await fetchMotivoBajas();
    setMotivosBaja(motivos);
    setMotivoSeleccionado(motivos[0]);
  };

  const cancelarBaja = () => {
    setProduccionToDelete(null);
    setProductionToDeleteNoItem(null);
  };

  const confirmarBaja = async () => {
    if (!produccionToDelete || !motivoSeleccionado) return;
    try {
      await actualizarProduccion(produccionToDelete.id, {
        codigo_baja: motivoSeleccionado.codigo_baja,
      });
      setProduccionToDelete(null);
      setProductionToDeleteNoItem(null);
      activateToast({
        message: i18n.produccion.successBaja,
        type: "success",
      });
      fetchAndSetProduccion(filtrosParseados, offset);
    } catch (error: any) {
      activateToast({
        message: error.message || i18n.produccion.errorBaja,
        type: "danger",
      });
    }
  };

  useEffect(() => {
    fetchAndSetProduccion(filtrosParseados, offset);
    const cargarLlenadoras = async () => {
      const dataLlenadoras = await fetchLlenadoras();
      setLlenadoras(dataLlenadoras || []);
    };
    cargarLlenadoras();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && showFiltros) {
        e.preventDefault();
        aplicarFiltrosBtnRef.current?.click();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showFiltros]);

  return (
    <div className="produccion-container">
      {/* Botones principales */}
      <div className="d-flex justify-content-between align-items-center mb-3 position-relative">
        <Button
          variant="outline-warning"
          size="sm"
          onClick={() => setShowModal(true)}
        >
          {i18n.produccion.columnasBtn}
        </Button>
        <div className="position-absolute top-50 start-50 translate-middle">
          <Button
            variant="warning"
            size="sm"
            onClick={() => setShowFiltros(true)}
          >
            {i18n.produccion.filtrosBtn}
          </Button>
        </div>
        <Paginator
          lastOffset={lastOffset}
          nextOffset={nextOffset}
          actualPage={actualPage}
          totalPages={totalPages}
          handleLastFn={handleAnterior}
          handleNextFn={handleSiguiente}
          goToPage={goToPage}
        />
      </div>

      <hr />

      {/* Tabla con scroll horizontal */}
      <HorizontalScrollTable
        rows={registros}
        columns={visibles}
        beautifyColumnFn={beautify}
        handleRowClickFn={handleRowClick}
        pipeRowValueFn={pipeRegistroValue}
        pageOffset={offset}
      />

      {/* Modal columnas */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        size="lg"
        centered
        dialogClassName="modal-bootstrap-columnas"
      >
        <Modal.Header closeButton>
          <Modal.Title>{i18n.produccion.columnasModalTitle}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="modal-bootstrap-checkbox-grid">
            {columnasDisponibles
              .filter((col) => col !== "Nº_de_ítem")
              .map((col) => (
                <label key={col} className="form-check-label">
                  <input
                    type="checkbox"
                    className="form-check-input me-1"
                    checked={visibles.includes(col)}
                    onChange={() => toggleColumna(col)}
                  />
                  {beautify(col)}
                </label>
              ))}
          </div>
        </Modal.Body>
      </Modal>

      {/* Modal filtros */}
      <Modal
        show={showFiltros}
        onHide={() => setShowFiltros(false)}
        centered
        dialogClassName="modal-bootstrap-dialog"
      >
        <div className="modal-bootstrap-content">
          <Modal.Header closeButton>
            <Modal.Title>{i18n.produccion.filtrosModalTitle}</Modal.Title>
          </Modal.Header>

          <div className="modal-bootstrap-body">
            <form className="modal-bootstrap-form">
              <div className="form-group">
                <label className="form-label">
                  {i18n.produccion.llenadoraLabel}
                </label>
                <select
                  className="form-select form-select-sm"
                  value={filtros.llenadora}
                  onChange={(e) =>
                    handleFiltroChange("llenadora", e.target.value)
                  }
                >
                  <option value="">{i18n.produccion.llenadoraTodas}</option>
                  {llenadoras.map((l) => (
                    <option key={l.id_llenadora} value={l.id_llenadora}>
                      {l.nombre_llenadora}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  {i18n.produccion.cabezalLabel}
                </label>
                <select
                  className="form-select form-select-sm"
                  value={filtros.cabezal}
                  onChange={(e) =>
                    handleFiltroChange("cabezal", e.target.value)
                  }
                >
                  <option value="">{i18n.produccion.cabezalTodos}</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                </select>
              </div>

              <div className="form-group form-group-doble">
                <div className="flex-fill">
                  <label className="form-label">
                    {i18n.produccion.bajaLabel}
                  </label>
                  <select
                    className="form-select form-select-sm"
                    value={filtros.baja}
                    onChange={(e) => handleFiltroChange("baja", e.target.value)}
                  >
                    <option value="">{i18n.produccion.seleccionar}</option>
                    <option value="true">{i18n.produccion.si}</option>
                    <option value="false">{i18n.produccion.no}</option>
                  </select>
                </div>
                <div className="flex-fill">
                  <label className="form-label">
                    {i18n.produccion.registradoLabel}
                  </label>
                  <select
                    className="form-select form-select-sm"
                    value={filtros.registrado}
                    onChange={(e) =>
                      handleFiltroChange("registrado", e.target.value)
                    }
                  >
                    <option value="">{i18n.produccion.seleccionar}</option>
                    <option value="true">{i18n.produccion.si}</option>
                    <option value="false">{i18n.produccion.no}</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  {i18n.produccion.tipoEtiquetaLabel}
                </label>
                <select
                  className="form-select form-select-sm"
                  value={filtros.tipoEtiqueta}
                  onChange={(e) =>
                    handleFiltroChange("tipoEtiqueta", e.target.value)
                  }
                >
                  <option value="">{i18n.produccion.seleccionar}</option>
                  <option value={i18n.produccion.tipoEtiquetaAuto}>
                    {i18n.produccion.tipoEtiquetaAuto}
                  </option>
                  <option value={i18n.produccion.tipoEtiquetaSemiauto}>
                    {i18n.produccion.tipoEtiquetaSemiauto}
                  </option>
                  <option value={i18n.produccion.tipoEtiquetaManual}>
                    {i18n.produccion.tipoEtiquetaManual}
                  </option>
                </select>
              </div>

              <div className="form-group form-group-doble">
                <div className="flex-fill">
                  <label className="form-label">
                    {i18n.produccion.fechaDesdeLabel}
                  </label>
                  <input
                    type="date"
                    className="form-control form-control-sm"
                    value={filtros.desde}
                    onChange={(e) =>
                      handleFiltroChange("desde", e.target.value)
                    }
                  />
                </div>
                <div className="flex-fill">
                  <label className="form-label">
                    {i18n.produccion.fechaHastaLabel}
                  </label>
                  <input
                    type="date"
                    className="form-control form-control-sm"
                    value={filtros.hasta}
                    onChange={(e) =>
                      handleFiltroChange("hasta", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="form-group form-group-doble">
                <div className="flex-fill">
                  <label className="form-label">
                    {i18n.produccion.horaDesdeLabel}
                  </label>
                  <input
                    type="text"
                    className={`form-control form-control-sm hora-input ${
                      filtros.horaDesde !== i18n.produccion.horaPlaceholder &&
                      !horaValida(filtros.horaDesde)
                        ? "is-invalid"
                        : ""
                    }`}
                    value={filtros.horaDesde}
                    placeholder={i18n.produccion.horaPlaceholder}
                    onChange={(e) =>
                      handleFiltroChange("horaDesde", e.target.value)
                    }
                  />
                  <div className="invalid-feedback">
                    {i18n.produccion.horaInvalid}
                  </div>
                </div>
                <div className="flex-fill">
                  <label className="form-label">
                    {i18n.produccion.horaHastaLabel}
                  </label>
                  <input
                    type="text"
                    className={`form-control form-control-sm hora-input ${
                      filtros.horaHasta !== i18n.produccion.horaPlaceholder &&
                      !horaValida(filtros.horaHasta)
                        ? "is-invalid"
                        : ""
                    }`}
                    value={filtros.horaHasta}
                    placeholder={i18n.produccion.horaPlaceholder}
                    onChange={(e) =>
                      handleFiltroChange("horaHasta", e.target.value)
                    }
                  />
                  <div className="invalid-feedback">
                    {i18n.produccion.horaInvalid}
                  </div>
                </div>
              </div>
            </form>
          </div>

          <div className="modal-bootstrap-footer">
            <Button variant="secondary" size="lg" onClick={resetFiltros}>
              {i18n.produccion.borrarCamposBtn}
            </Button>
            <Button
              variant="warning"
              size="lg"
              onClick={handleAplicarFiltros}
              ref={aplicarFiltrosBtnRef}
            >
              {i18n.produccion.aplicarFiltrosBtn}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal dar de baja */}
      <Modal
        show={!!produccionToDelete}
        onHide={cancelarBaja}
        centered
        dialogClassName="modal-bootstrap-dialog"
      >
        <div className="modal-bootstrap-content">
          <Modal.Header closeButton>
            <Modal.Title>{i18n.produccion.bajaModalTitle}</Modal.Title>
          </Modal.Header>
          <div className="modal-bootstrap-body">
            <p className="mb-3">
              {i18n.produccion.bajaConfirmMsg}{" "}
              <span>{productionToDeleteNoItem || ""}</span>?
            </p>
            <div className="form-group modal-dar-de-baja">
              <label className="form-label">
                {i18n.produccion.motivoBajaLabel}
              </label>
              <select
                className="form-select form-select-sm"
                value={motivoSeleccionado?.codigo_baja || ""}
                onChange={(e) => {
                  const seleccionado = motivosBaja.find(
                    (m) => m.codigo_baja === e.target.value
                  );
                  setMotivoSeleccionado(seleccionado || null);
                }}
              >
                <option value="" disabled>
                  {i18n.produccion.seleccionaMotivo}
                </option>
                {motivosBaja.map((motivo) => (
                  <option key={motivo.codigo_baja} value={motivo.codigo_baja}>
                    {motivo.nombre_baja}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="modal-bootstrap-footer">
            <Button variant="secondary" onClick={cancelarBaja}>
              {i18n.produccion.cancelarBtn}
            </Button>
            <Button variant="danger" onClick={confirmarBaja}>
              {i18n.produccion.confirmarBajaBtn}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Produccion;

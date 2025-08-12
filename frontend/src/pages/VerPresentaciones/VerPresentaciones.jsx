import { useState, useEffect, useRef } from "react";
import "../../modales-bootstrap.css";
import "./VerPresentaciones.css";
import { Button, Modal } from "react-bootstrap";
import { activateToast } from "../../components/ToastMessage/helpers/ToastMessage.helpers";
import {
  queryPresentaciones,
  deletePresentacion,
} from "./services/VerPresentaciones";
import HorizontalScrollTable from "../../components/HorizontalScrollTable/HorizontalScrollTable";
import Paginator from "../../components/Paginator/Paginator";
import {
  TABLE_ROWS_LIMIT,
  USER_ROLES,
} from "../../common/constants/shared.constants";
import { i18n } from "../../i18n";

const columnasDisponibles = [
  "Nº_de_ítem",
  "id_presentacion",
  "nombre_presentacion",
  "peso_neto",
  "peso_bruto",
];

const columnasBeautify = {
  Nº_de_ítem: i18n.verPresentaciones.colItem,
  id_presentacion: i18n.verPresentaciones.colIdPresentacion,
  nombre_presentacion: i18n.verPresentaciones.colNombrePresentacion,
  peso_neto: i18n.verPresentaciones.colPesoNeto,
  peso_bruto: i18n.verPresentaciones.colPesoBruto,
};

const beautify = (text) => columnasBeautify[text];

const VerPresentaciones = ({ userRole }) => {
  const aplicarFiltrosBtnRef = useRef(null);
  const [visibles, setVisibles] = useState(columnasDisponibles);
  const [showModal, setShowModal] = useState(false);
  const [showFiltros, setShowFiltros] = useState(false);
  const [limit, setLimit] = useState(TABLE_ROWS_LIMIT);
  const [offset, setOffset] = useState(0);
  const [paginatedResponse, setPaginatedResponse] = useState(1);
  const [lastOffset, setLastOffset] = useState(null);
  const [nextOffset, setNextOffset] = useState(null);
  const [actualPage, setActualPage] = useState(null);
  const [totalPages, setTotalPages] = useState(null);
  const [registros, setRegistros] = useState([]);
  const [filtrosParseados, setFiltrosParseados] = useState({});
  const [presentacionToDelete, setPresentacionToDelete] = useState(null);
  const [presentacionToDeleteNoItem, setPresentacionToDeleteNoItem] =
    useState(null);
  const isUserAdmin = userRole === USER_ROLES.ADMINISTRADOR;

  const [filtros, setFiltros] = useState({
    idPresentacion: "",
    nombrePresentacion: "",
    pesoNetoDesde: "",
    pesoNetoHasta: "",
    pesoBrutoDesde: "",
    pesoBrutoHasta: "",
  });
  const [erroresFiltros, setErroresFiltros] = useState({
    idPresentacion: false,
    nombrePresentacion: false,
    pesoNetoDesde: false,
    pesoNetoHasta: false,
    pesoBrutoDesde: false,
    pesoBrutoHasta: false,
    pesoNetoInvalido: false,
    pesoBrutoInvalido: false,
  });

  const validarPeso = (desde, hasta) =>
    desde !== "" && hasta !== "" && parseFloat(desde) > parseFloat(hasta);

  const toggleColumna = (col) => {
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
    fetchAndSetPresentaciones(filtrosParseados, lastOffset);
  };

  const handleSiguiente = () => {
    if (nextOffset === null) return;
    fetchAndSetPresentaciones(filtrosParseados, nextOffset);
  };

  const goToPage = (pageNumber) => {
    const goToPageOffset = pageNumber * limit - limit;
    fetchAndSetPresentaciones(setFetchBody(), goToPageOffset);
  };

  const handleFiltroChange = (campo, valor) => {
    setFiltros((prev) => {
      const nuevo = { ...prev, [campo]: valor };

      setErroresFiltros((prevErrores) => {
        const nuevosErrores = { ...prevErrores };

        if (campo === "idPresentacion") {
          nuevosErrores.idPresentacion = valor.length > 15;
        } else if (campo === "nombrePresentacion") {
          nuevosErrores.nombrePresentacion = valor.length > 200;
        } else if (
          campo.startsWith("pesoNeto") ||
          campo.startsWith("pesoBruto")
        ) {
          const num = parseFloat(valor);
          nuevosErrores[campo] =
            valor !== "" && (isNaN(num) || num < 0 || num > 99999.99);
        }

        nuevosErrores.pesoNetoInvalido = validarPeso(
          nuevo.pesoNetoDesde,
          nuevo.pesoNetoHasta
        );
        nuevosErrores.pesoBrutoInvalido = validarPeso(
          nuevo.pesoBrutoDesde,
          nuevo.pesoBrutoHasta
        );

        return nuevosErrores;
      });

      return nuevo;
    });
  };

  const resetFiltros = () => {
    setFiltros({
      idPresentacion: "",
      nombrePresentacion: "",
      pesoNetoDesde: "",
      pesoNetoHasta: "",
      pesoBrutoDesde: "",
      pesoBrutoHasta: "",
    });
    setFiltrosParseados({});
  };

  const setFetchBody = () => {
    const body = { where: {} };

    if (filtros.idPresentacion)
      body.where.id_presentacion = { like: filtros.idPresentacion };
    if (filtros.nombrePresentacion)
      body.where.nombre_presentacion = { like: filtros.nombrePresentacion };

    if (filtros.pesoNetoDesde !== "" && filtros.pesoNetoHasta !== "") {
      body.where.peso_neto = {
        between: [
          parseFloat(filtros.pesoNetoDesde),
          parseFloat(filtros.pesoNetoHasta),
        ],
      };
    } else if (filtros.pesoNetoDesde !== "") {
      body.where.peso_neto = { gte: parseFloat(filtros.pesoNetoDesde) };
    } else if (filtros.pesoNetoHasta !== "") {
      body.where.peso_neto = { lte: parseFloat(filtros.pesoNetoHasta) };
    }

    if (filtros.pesoBrutoDesde !== "" && filtros.pesoBrutoHasta !== "") {
      body.where.peso_bruto = {
        between: [
          parseFloat(filtros.pesoBrutoDesde),
          parseFloat(filtros.pesoBrutoHasta),
        ],
      };
    } else if (filtros.pesoBrutoDesde !== "") {
      body.where.peso_bruto = { gte: parseFloat(filtros.pesoBrutoDesde) };
    } else if (filtros.pesoBrutoHasta !== "") {
      body.where.peso_bruto = { lte: parseFloat(filtros.pesoBrutoHasta) };
    }

    return body;
  };

  const fetchAndSetPresentaciones = async (body, newOffset = 0) => {
    let finalBody = { ...body, where: { ...body?.where } };
    finalBody.where.visible = { eq: true };
    finalBody.order = { nombre_presentacion: "ASC" };
    try {
      const data = await queryPresentaciones(finalBody, {
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
    } catch (error) {
      console.error("Error al cargar las presentaciones:", error.message);
    }
  };

  const handleAplicarFiltros = () => {
    if (
      Object.values(erroresFiltros).some((e) => e) ||
      erroresFiltros.pesoNetoInvalido ||
      erroresFiltros.pesoBrutoInvalido
    )
      return;

    const body = setFetchBody();

    setFiltrosParseados(body);
    setShowFiltros(false);
    fetchAndSetPresentaciones(body, 0);
  };

  const handleRowClick = async (registro, no_item) => {
    if (!isUserAdmin) return;
    setPresentacionToDelete(registro);
    setPresentacionToDeleteNoItem(no_item);
  };

  const pipeRowValue = (col, registro, index, offset) => {
    return col === "Nº_de_ítem" ? index + offset + 1 : registro[col] ?? "";
  };

  const cancelarBaja = () => {
    setPresentacionToDelete(null);
    setPresentacionToDeleteNoItem(null);
  };

  const confirmarBaja = async () => {
    if (!presentacionToDelete) return;
    try {
      await deletePresentacion(presentacionToDelete.id);
      setPresentacionToDelete(null);
      setPresentacionToDeleteNoItem(null);
      activateToast({
        message: i18n.verPresentaciones.successEliminarPresentacion,
        type: "success",
      });
      fetchAndSetPresentaciones(filtrosParseados, offset);
    } catch (error) {
      activateToast({
        message:
          error.message || i18n.verPresentaciones.errorEliminarPresentacion,
        type: "danger",
      });
    }
  };

  useEffect(() => {
    fetchAndSetPresentaciones(filtrosParseados, offset);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
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
      <div className="d-flex justify-content-between align-items-center mb-3 position-relative">
        <Button
          variant="outline-warning"
          size="sm"
          onClick={() => setShowModal(true)}
        >
          {i18n.verPresentaciones.columnasBtn}
        </Button>
        <div className="position-absolute top-50 start-50 translate-middle">
          <Button
            variant="warning"
            size="sm"
            onClick={() => setShowFiltros(true)}
          >
            {i18n.verPresentaciones.filtrosBtn}
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

      <HorizontalScrollTable
        rows={registros}
        columns={visibles}
        beautifyColumnFn={beautify}
        handleRowClickFn={handleRowClick}
        pipeRowValueFn={pipeRowValue}
        pageOffset={offset}
      />

      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        centered
        dialogClassName="modal-bootstrap-columnas"
      >
        <Modal.Header closeButton>
          <Modal.Title>{i18n.verPresentaciones.columnasModalTitle}</Modal.Title>
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

      <Modal
        show={showFiltros}
        onHide={() => setShowFiltros(false)}
        centered
        dialogClassName="modal-bootstrap-dialog"
      >
        <div className="modal-bootstrap-content">
          <Modal.Header closeButton>
            <Modal.Title>
              {i18n.verPresentaciones.filtrosModalTitle}
            </Modal.Title>
          </Modal.Header>
          <div className="modal-bootstrap-body">
            <form className="modal-bootstrap-form">
              <div className="form-group">
                <label className="form-label">
                  {i18n.verPresentaciones.idPresentacionLabel}
                </label>
                <input
                  type="text"
                  className={`form-control form-control-sm ${
                    erroresFiltros.idPresentacion ? "is-invalid" : ""
                  }`}
                  value={filtros.idPresentacion}
                  onChange={(e) =>
                    handleFiltroChange("idPresentacion", e.target.value)
                  }
                />
                <div className="invalid-feedback">
                  {i18n.verPresentaciones.idPresentacionInvalid}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">
                  {i18n.verPresentaciones.nombrePresentacionLabel}
                </label>
                <input
                  type="text"
                  className={`form-control form-control-sm ${
                    erroresFiltros.nombrePresentacion ? "is-invalid" : ""
                  }`}
                  value={filtros.nombrePresentacion}
                  onChange={(e) =>
                    handleFiltroChange("nombrePresentacion", e.target.value)
                  }
                />
                <div className="invalid-feedback">
                  {i18n.verPresentaciones.nombrePresentacionInvalid}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label d-block">
                  {i18n.verPresentaciones.pesoNetoLabel}
                </label>
                <div className="rango-pesos d-flex justify-content-between">
                  <input
                    type="number"
                    step="0.01"
                    placeholder={i18n.verPresentaciones.pesoNetoDesde}
                    className={`form-control form-control-sm ${
                      erroresFiltros.pesoNetoDesde ? "is-invalid" : ""
                    }`}
                    value={filtros.pesoNetoDesde}
                    onChange={(e) =>
                      handleFiltroChange("pesoNetoDesde", e.target.value)
                    }
                  />
                  <input
                    type="number"
                    step="0.01"
                    placeholder={i18n.verPresentaciones.pesoNetoHasta}
                    className={`form-control form-control-sm ${
                      erroresFiltros.pesoNetoHasta ? "is-invalid" : ""
                    }`}
                    value={filtros.pesoNetoHasta}
                    onChange={(e) =>
                      handleFiltroChange("pesoNetoHasta", e.target.value)
                    }
                  />
                </div>
                <div className="invalid-feedback d-block">
                  {(erroresFiltros.pesoNetoDesde ||
                    erroresFiltros.pesoNetoHasta) &&
                    i18n.verPresentaciones.pesoNetoInvalid}
                  {erroresFiltros.pesoNetoInvalido && (
                    <div className="text-danger">
                      {i18n.verPresentaciones.pesoNetoInvalido}
                    </div>
                  )}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label d-block">
                  {i18n.verPresentaciones.pesoBrutoLabel}
                </label>
                <div className="rango-pesos d-flex justify-content-between">
                  <input
                    type="number"
                    step="0.01"
                    placeholder={i18n.verPresentaciones.pesoBrutoDesde}
                    className={`form-control form-control-sm ${
                      erroresFiltros.pesoBrutoDesde ? "is-invalid" : ""
                    }`}
                    value={filtros.pesoBrutoDesde}
                    onChange={(e) =>
                      handleFiltroChange("pesoBrutoDesde", e.target.value)
                    }
                  />
                  <input
                    type="number"
                    step="0.01"
                    placeholder={i18n.verPresentaciones.pesoBrutoHasta}
                    className={`form-control form-control-sm ${
                      erroresFiltros.pesoBrutoHasta ? "is-invalid" : ""
                    }`}
                    value={filtros.pesoBrutoHasta}
                    onChange={(e) =>
                      handleFiltroChange("pesoBrutoHasta", e.target.value)
                    }
                  />
                </div>
                <div className="invalid-feedback d-block">
                  {(erroresFiltros.pesoBrutoDesde ||
                    erroresFiltros.pesoBrutoHasta) &&
                    i18n.verPresentaciones.pesoBrutoInvalid}
                  {erroresFiltros.pesoBrutoInvalido && (
                    <div className="text-danger">
                      {i18n.verPresentaciones.pesoBrutoInvalido}
                    </div>
                  )}
                </div>
              </div>
            </form>
          </div>
          <div className="modal-bootstrap-footer">
            <Button variant="secondary" size="md" onClick={resetFiltros}>
              {i18n.verPresentaciones.borrarCamposBtn}
            </Button>
            <Button
              variant="warning"
              size="md"
              onClick={handleAplicarFiltros}
              ref={aplicarFiltrosBtnRef}
            >
              {i18n.verPresentaciones.aplicarFiltrosBtn}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        show={!!presentacionToDelete}
        onHide={cancelarBaja}
        centered
        dialogClassName="modal-bootstrap-dialog"
      >
        <div className="modal-bootstrap-content">
          <Modal.Header closeButton>
            <Modal.Title>
              {i18n.verPresentaciones.eliminarModalTitle}
            </Modal.Title>
          </Modal.Header>
          <div className="modal-bootstrap-body">
            <p className="mb-3">
              {i18n.verPresentaciones.eliminarConfirmMsg}{" "}
              <span>{presentacionToDeleteNoItem || ""}</span>?
            </p>
          </div>
          <div className="modal-bootstrap-footer">
            <Button variant="secondary" onClick={cancelarBaja}>
              {i18n.verPresentaciones.cancelarBtn}
            </Button>
            <Button variant="danger" onClick={confirmarBaja}>
              {i18n.verPresentaciones.confirmarEliminarBtn}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default VerPresentaciones;

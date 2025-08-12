import { useState, useEffect, useRef } from "react";
import "../../modales-bootstrap.css";
import "./VerEans.css";
import { Button, Modal } from "react-bootstrap";
import { activateToast } from "../../components/ToastMessage/helpers/ToastMessage.helpers";
import { queryEans, deleteEan } from "./services/VerEans";
import HorizontalScrollTable from "../../components/HorizontalScrollTable/HorizontalScrollTable";
import Paginator from "../../components/Paginator/Paginator";
import {
  TABLE_ROWS_LIMIT,
  USER_ROLES,
} from "../../common/constants/shared.constants";
import { i18n } from "../../i18n";

const columnasDisponibles = [
  "Nº_de_ítem",
  "id_producto",
  "id_presentacion",
  "codigo_ean",
  "dias_best_before",
];

const columnasBeautify = {
  Nº_de_ítem: i18n.verEans.colItem,
  id_producto: i18n.verEans.colIdProducto,
  id_presentacion: i18n.verEans.colIdPresentacion,
  codigo_ean: i18n.verEans.colCodigoEAN,
  dias_best_before: i18n.verEans.colDiasBestBefore,
};

const beautify = (text) => {
  return columnasBeautify[text];
};

const VerEans = ({ userRole }) => {
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
  const [eanToDelete, setEanToDelete] = useState(null);
  const [eanToDeleteNoItem, setEanToDeleteNoItem] = useState(null);
  const isUserAdmin = userRole === USER_ROLES.ADMINISTRADOR;

  const [filtros, setFiltros] = useState({
    idProducto: "",
    idPresentacion: "",
    codigoEan: "",
    diasBestBeforeDesde: "",
    diasBestBeforeHasta: "",
  });
  const [erroresFiltros, setErroresFiltros] = useState({
    idProducto: false,
    idPresentacion: false,
    codigoEan: false,
    diasBestBeforeDesde: false,
    diasBestBeforeHasta: false,
    diasBestBeforeInvalido: false,
  });

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
    fetchAndSetEans(filtrosParseados, lastOffset);
  };

  const handleSiguiente = () => {
    if (nextOffset === null) return;
    fetchAndSetEans(filtrosParseados, nextOffset);
  };

  const goToPage = (pageNumber) => {
    const goToPageOffset = pageNumber * limit - limit;
    fetchAndSetEans(setFetchBody(), goToPageOffset);
  };

  const validarDiasBestBefore = (desde, hasta) =>
    desde !== "" && hasta !== "" && parseInt(desde) > parseInt(hasta);

  const handleFiltroChange = (campo, valor) => {
    setFiltros((prev) => {
      const nuevo = { ...prev, [campo]: valor };

      setErroresFiltros((prevErrores) => {
        const nuevosErrores = { ...prevErrores };

        if (campo === "idProducto" || campo === "idPresentacion") {
          nuevosErrores[campo] = valor.length > 15;
        } else if (campo === "codigoEan") {
          nuevosErrores[campo] = valor.length > 30;
        } else if (
          campo === "diasBestBeforeDesde" ||
          campo === "diasBestBeforeHasta"
        ) {
          const num = parseInt(valor);
          nuevosErrores[campo] =
            valor !== "" && (isNaN(num) || num < 1 || num > 36500);
        }

        nuevosErrores.diasBestBeforeInvalido = validarDiasBestBefore(
          nuevo.diasBestBeforeDesde,
          nuevo.diasBestBeforeHasta
        );

        return nuevosErrores;
      });

      return nuevo;
    });
  };

  const resetFiltros = () => {
    setFiltros({
      idProducto: "",
      idPresentacion: "",
      codigoEan: "",
      diasBestBeforeDesde: "",
      diasBestBeforeHasta: "",
    });
    setFiltrosParseados({});
  };

  const setFetchBody = () => {
    const body = { where: {} };

    if (filtros.idProducto)
      body.where.id_producto = { like: filtros.idProducto };
    if (filtros.idPresentacion)
      body.where.id_presentacion = { like: filtros.idPresentacion };
    if (filtros.codigoEan) body.where.codigo_ean = { like: filtros.codigoEan };
    if (
      filtros.diasBestBeforeDesde !== "" &&
      filtros.diasBestBeforeHasta !== ""
    ) {
      body.where.dias_best_before = {
        between: [
          parseInt(filtros.diasBestBeforeDesde),
          parseInt(filtros.diasBestBeforeHasta),
        ],
      };
    } else if (filtros.diasBestBeforeDesde !== "") {
      body.where.dias_best_before = {
        gte: parseInt(filtros.diasBestBeforeDesde),
      };
    } else if (filtros.diasBestBeforeHasta !== "") {
      body.where.dias_best_before = {
        lte: parseInt(filtros.diasBestBeforeHasta),
      };
    }

    return body;
  };

  const fetchAndSetEans = async (body, newOffset = 0) => {
    let finalBody = { ...body, where: { ...body?.where } };
    finalBody.where.visible = { eq: true };
    try {
      const data = await queryEans(finalBody, {
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
      console.error("Error al cargar los códigos EAN:", error.message);
    }
  };

  const handleAplicarFiltros = () => {
    if (Object.values(erroresFiltros).some((e) => e)) return;

    const body = setFetchBody();

    setFiltrosParseados(body);
    setShowFiltros(false);
    fetchAndSetEans(body, 0);
  };

  const handleRowClick = async (registro, no_item) => {
    if (!isUserAdmin) return;
    setEanToDelete(registro);
    setEanToDeleteNoItem(no_item);
  };

  const pipeRowValue = (col, registro, index, offset) => {
    return col === "Nº_de_ítem" ? index + offset + 1 : registro[col] ?? "";
  };

  const cancelarBaja = () => {
    setEanToDelete(null);
    setEanToDeleteNoItem(null);
  };

  const confirmarBaja = async () => {
    if (!eanToDelete) return;
    try {
      await deleteEan(eanToDelete.id);
      setEanToDelete(null);
      setEanToDeleteNoItem(null);
      activateToast({
        message: i18n.verEans.successEliminarEan,
        type: "success",
      });
      fetchAndSetEans(filtrosParseados, offset);
    } catch (error) {
      activateToast({
        message: error.message || i18n.verEans.errorEliminarPresentacion,
        type: "danger",
      });
    }
  };

  useEffect(() => {
    fetchAndSetEans(filtrosParseados, offset);
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
          {i18n.verEans.columnasBtn}
        </Button>
        <div className="position-absolute top-50 start-50 translate-middle">
          <Button
            variant="warning"
            size="sm"
            onClick={() => setShowFiltros(true)}
          >
            {i18n.verEans.filtrosBtn}
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
          <Modal.Title>{i18n.verEans.columnasModalTitle}</Modal.Title>
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
            <Modal.Title>{i18n.verEans.filtrosModalTitle}</Modal.Title>
          </Modal.Header>
          <div className="modal-bootstrap-body">
            <form className="modal-bootstrap-form">
              <div className="form-group">
                <label className="form-label">
                  {i18n.verEans.idProductoLabel}
                </label>
                <input
                  type="text"
                  className={`form-control form-control-sm ${
                    erroresFiltros.idProducto ? "is-invalid" : ""
                  }`}
                  value={filtros.idProducto}
                  onChange={(e) =>
                    handleFiltroChange("idProducto", e.target.value)
                  }
                />
                <div className="invalid-feedback">
                  {i18n.verEans.idProductoInvalid}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">
                  {i18n.verEans.idPresentacionLabel}
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
                  {i18n.verEans.idPresentacionInvalid}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">
                  {i18n.verEans.codigoEanLabel}
                </label>
                <input
                  type="text"
                  className={`form-control form-control-sm ${
                    erroresFiltros.codigoEan ? "is-invalid" : ""
                  }`}
                  value={filtros.codigoEan}
                  onChange={(e) =>
                    handleFiltroChange("codigoEan", e.target.value)
                  }
                />
                <div className="invalid-feedback">
                  {i18n.verEans.codigoEanInvalid}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label d-block">
                  {i18n.verEans.diasBestBeforeLabel}
                </label>
                <div className="rango-pesos d-flex justify-content-between">
                  <input
                    type="number"
                    placeholder={i18n.verEans.diasBestBeforeDesde}
                    className={`form-control form-control-sm ${
                      erroresFiltros.diasBestBeforeDesde ? "is-invalid" : ""
                    }`}
                    value={filtros.diasBestBeforeDesde}
                    onChange={(e) =>
                      handleFiltroChange("diasBestBeforeDesde", e.target.value)
                    }
                  />
                  <input
                    type="number"
                    placeholder={i18n.verEans.diasBestBeforeHasta}
                    className={`form-control form-control-sm ${
                      erroresFiltros.diasBestBeforeHasta ? "is-invalid" : ""
                    }`}
                    value={filtros.diasBestBeforeHasta}
                    onChange={(e) =>
                      handleFiltroChange("diasBestBeforeHasta", e.target.value)
                    }
                  />
                </div>
                <div className="invalid-feedback d-block">
                  {(erroresFiltros.diasBestBeforeDesde ||
                    erroresFiltros.diasBestBeforeHasta) &&
                    i18n.verEans.diasBestBeforeInvalid}
                  {erroresFiltros.diasBestBeforeInvalido && (
                    <div className="text-danger">
                      {i18n.verEans.diasBestBeforeInvalido}
                    </div>
                  )}
                </div>
              </div>
            </form>
          </div>
          <div className="modal-bootstrap-footer">
            <Button variant="secondary" size="md" onClick={resetFiltros}>
              {i18n.verEans.borrarCamposBtn}
            </Button>
            <Button
              variant="warning"
              size="md"
              onClick={handleAplicarFiltros}
              ref={aplicarFiltrosBtnRef}
            >
              {i18n.verEans.aplicarFiltrosBtn}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        show={!!eanToDelete}
        onHide={cancelarBaja}
        centered
        dialogClassName="modal-bootstrap-dialog"
      >
        <div className="modal-bootstrap-content">
          <Modal.Header closeButton>
            <Modal.Title>{i18n.verEans.eliminarModalTitle}</Modal.Title>
          </Modal.Header>
          <div className="modal-bootstrap-body">
            <p className="mb-3">
              {i18n.verEans.eliminarConfirmMsg}{" "}
              <span>{eanToDeleteNoItem || ""}</span>?
            </p>
          </div>
          <div className="modal-bootstrap-footer">
            <Button variant="secondary" onClick={cancelarBaja}>
              {i18n.verEans.cancelarBtn}
            </Button>
            <Button variant="danger" onClick={confirmarBaja}>
              {i18n.verEans.confirmarEliminarBtn}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default VerEans;

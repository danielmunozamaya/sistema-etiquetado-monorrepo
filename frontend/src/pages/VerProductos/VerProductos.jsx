import { useState, useEffect, useRef } from "react";
import "./VerProductos.css";
import { Button, Modal } from "react-bootstrap";
import { activateToast } from "../../components/ToastMessage/helpers/ToastMessage.helpers";
import {
  queryProductos,
  fetchFamilias,
  deleteProducto,
} from "./services/VerProductos";
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
  "nombre_producto",
  "familia_producto",
];

const columnasBeautify = {
  Nº_de_ítem: i18n.verProductos.colItem,
  id_producto: i18n.verProductos.colIdProducto,
  nombre_producto: i18n.verProductos.colNombreProducto,
  familia_producto: i18n.verProductos.colFamiliaProducto,
};

const beautify = (text) => columnasBeautify[text];

const VerProductos = ({ userRole }) => {
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
  // const [familias, setFamilias] = useState([]);
  const [filtrosParseados, setFiltrosParseados] = useState({});
  const [productoToDelete, setProductoToDelete] = useState(null);
  const [productoToDeleteNoItem, setProductoToDeleteNoItem] = useState(null);
  const isUserAdmin = userRole === USER_ROLES.ADMINISTRADOR;

  const [filtros, setFiltros] = useState({
    idProducto: "",
    nombreProducto: "",
    familiaProducto: "",
  });
  const [erroresFiltros, setErroresFiltros] = useState({
    idProducto: false,
    nombreProducto: false,
    familiaProducto: false,
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
    fetchAndSetProductos(filtrosParseados, lastOffset);
  };

  const handleSiguiente = () => {
    if (nextOffset === null) return;
    fetchAndSetProductos(filtrosParseados, nextOffset);
  };

  const goToPage = (pageNumber) => {
    const goToPageOffset = pageNumber * limit - limit;
    fetchAndSetProductos(setFetchBody(), goToPageOffset);
  };

  const handleFiltroChange = (campo, valor) => {
    setFiltros((prev) => ({ ...prev, [campo]: valor }));

    const limites = {
      idProducto: 15,
      nombreProducto: 200,
      familiaProducto: 200,
    };

    setErroresFiltros((prev) => ({
      ...prev,
      [campo]: valor.length > limites[campo],
    }));
  };

  const resetFiltros = () => {
    setFiltros({
      idProducto: "",
      nombreProducto: "",
      familiaProducto: "",
    });
    setFiltrosParseados({});
  };

  const setFetchBody = () => {
    const body = { where: {} };

    if (filtros.idProducto)
      body.where.id_producto = { like: filtros.idProducto };
    if (filtros.nombreProducto)
      body.where.nombre_producto = { like: filtros.nombreProducto };
    if (filtros.familiaProducto)
      body.where.familia_producto = { like: filtros.familiaProducto };

    return body;
  };

  const fetchAndSetProductos = async (body, newOffset = 0) => {
    let finalBody = { ...body, where: { ...body?.where } };
    finalBody.where.visible = { eq: true };
    finalBody.order = { nombre_producto: "ASC" };
    try {
      const data = await queryProductos(finalBody, {
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
      console.error("Error al cargar productos:", error.message);
    }
  };

  const handleAplicarFiltros = () => {
    if (Object.values(erroresFiltros).some((e) => e)) return;

    const body = setFetchBody();

    setFiltrosParseados(body);
    setShowFiltros(false);
    fetchAndSetProductos(body, 0);
  };

  const handleRowClick = async (registro, no_item) => {
    if (!isUserAdmin) return;
    setProductoToDelete(registro);
    setProductoToDeleteNoItem(no_item);
  };

  const pipeRowValue = (col, registro, index, offset) => {
    return col === "Nº_de_ítem" ? index + offset + 1 : registro[col] ?? "";
  };

  const cancelarBaja = () => {
    setProductoToDelete(null);
    setProductoToDeleteNoItem(null);
  };

  const confirmarBaja = async () => {
    if (!productoToDelete) return;
    try {
      await deleteProducto(productoToDelete.id);
      setProductoToDelete(null);
      setProductoToDeleteNoItem(null);
      activateToast({
        message: i18n.verProductos.successEliminarProducto,
        type: "success",
      });
      fetchAndSetProductos(filtrosParseados, offset);
    } catch (error) {
      activateToast({
        message: error.message || i18n.verProductos.errorEliminarProducto,
        type: "danger",
      });
    }
  };

  useEffect(() => {
    fetchAndSetProductos(filtrosParseados, offset);
    // const cargarFamilias = async () => {
    //   const dataFamilias = await fetchFamilias();
    //   console.log(dataFamilias)
    //   setFamilias(dataFamilias || []);
    // };
    // cargarFamilias();
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
      <div className="d-flex justify-content-between align-items-center position-relative">
        <Button
          variant="outline-warning"
          size="sm"
          onClick={() => setShowModal(true)}
        >
          {i18n.verProductos.columnasBtn}
        </Button>
        <div className="position-absolute top-50 start-50 translate-middle">
          <Button
            variant="warning"
            size="sm"
            onClick={() => setShowFiltros(true)}
          >
            {i18n.verProductos.filtrosBtn}
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
          <Modal.Title>{i18n.verProductos.columnasModalTitle}</Modal.Title>
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
            <Modal.Title>{i18n.verProductos.filtrosModalTitle}</Modal.Title>
          </Modal.Header>
          <div className="modal-bootstrap-body">
            <form className="modal-bootstrap-form">
              <div className="form-group">
                <label className="form-label">
                  {i18n.verProductos.idProductoLabel}
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
                  {i18n.verProductos.idProductoInvalid}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">
                  {i18n.verProductos.nombreProductoLabel}
                </label>
                <input
                  type="text"
                  className={`form-control form-control-sm ${
                    erroresFiltros.nombreProducto ? "is-invalid" : ""
                  }`}
                  value={filtros.nombreProducto}
                  onChange={(e) =>
                    handleFiltroChange("nombreProducto", e.target.value)
                  }
                />
                <div className="invalid-feedback">
                  {i18n.verProductos.nombreProductoInvalid}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">
                  {i18n.verProductos.familiaProductoLabel}
                </label>
                <input
                  type="text"
                  className={`form-control form-control-sm ${
                    erroresFiltros.familiaProducto ? "is-invalid" : ""
                  }`}
                  value={filtros.familiaProducto}
                  onChange={(e) =>
                    handleFiltroChange("familiaProducto", e.target.value)
                  }
                />
                <div className="invalid-feedback">
                  {i18n.verProductos.familiaProductoInvalid}
                </div>
              </div>
            </form>
          </div>
          <div className="modal-bootstrap-footer">
            <Button variant="secondary" size="md" onClick={resetFiltros}>
              {i18n.verProductos.borrarCamposBtn}
            </Button>
            <Button
              variant="warning"
              size="md"
              onClick={handleAplicarFiltros}
              ref={aplicarFiltrosBtnRef}
            >
              {i18n.verProductos.aplicarFiltrosBtn}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        show={!!productoToDelete}
        onHide={cancelarBaja}
        centered
        dialogClassName="modal-bootstrap-dialog"
      >
        <div className="modal-bootstrap-content">
          <Modal.Header closeButton>
            <Modal.Title>{i18n.verProductos.eliminarModalTitle}</Modal.Title>
          </Modal.Header>
          <div className="modal-bootstrap-body">
            <p className="mb-3">
              {i18n.verProductos.eliminarConfirmMsg}{" "}
              <span>{productoToDeleteNoItem || ""}</span>?
            </p>
          </div>
          <div className="modal-bootstrap-footer">
            <Button variant="secondary" onClick={cancelarBaja}>
              {i18n.verProductos.cancelarBtn}
            </Button>
            <Button variant="danger" onClick={confirmarBaja}>
              {i18n.verProductos.confirmarEliminarBtn}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default VerProductos;

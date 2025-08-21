import { useState, useEffect, useRef } from "react";
import "./VerProductos.css";
import { Button, Modal } from "react-bootstrap";
import { activateToast } from "../../components/ToastMessage/helpers/ToastMessage.helpers";
import {
  queryProductos,
  // fetchFamilias,
  deleteProducto,
} from "./services/VerProductos"
import HorizontalScrollTable from "../../components/HorizontalScrollTable/HorizontalScrollTable";
import Paginator from "../../components/Paginator/Paginator";
import {
  TABLE_ROWS_LIMIT,
  USER_ROLE,
} from "../../common/constants/shared.constants";
import { i18n } from "../../i18n";

interface Producto {
  id: string | number;
  id_producto: string;
  nombre_producto: string;
  familia_producto: string;
  [key: string]: any;
}

interface VerProductosProps {
  userRole: string;
}

const columnasDisponibles = [
  "Nº_de_ítem",
  "id_producto",
  "nombre_producto",
  "familia_producto",
];

const columnasBeautify: Record<string, string> = {
  Nº_de_ítem: i18n.verProductos.colItem,
  id_producto: i18n.verProductos.colIdProducto,
  nombre_producto: i18n.verProductos.colNombreProducto,
  familia_producto: i18n.verProductos.colFamiliaProducto,
};

const beautify = (text: string) => columnasBeautify[text];

const VerProductos: React.FC<VerProductosProps> = ({ userRole }) => {
  const aplicarFiltrosBtnRef = useRef<HTMLButtonElement>(null);
  const [visibles, setVisibles] = useState<string[]>(columnasDisponibles);
  const [showModal, setShowModal] = useState(false);
  const [showFiltros, setShowFiltros] = useState(false);
  const [limit] = useState(TABLE_ROWS_LIMIT);
  const [offset, setOffset] = useState(0);
  const [paginatedResponse] = useState(1);
  const [lastOffset, setLastOffset] = useState<number | null>(null);
  const [nextOffset, setNextOffset] = useState<number | null>(null);
  const [actualPage, setActualPage] = useState<number | null>(null);
  const [totalPages, setTotalPages] = useState<number | null>(null);
  const [registros, setRegistros] = useState<Producto[]>([]);
  // const [familias, setFamilias] = useState<any[]>([]);
  const [filtrosParseados, setFiltrosParseados] = useState<Record<string, any>>(
    {}
  );
  const [productoToDelete, setProductoToDelete] = useState<Producto | null>(
    null
  );
  const [productoToDeleteNoItem, setProductoToDeleteNoItem] = useState<
    number | null
  >(null);
  const isUserAdmin = userRole === USER_ROLE.ADMINISTRADOR;

  const [filtros, setFiltros] = useState({
    idProducto: "",
    nombreProducto: "",
    familiaProducto: "",
  });
  const [erroresFiltros, setErroresFiltros] = useState<{
    [key: string]: boolean;
    idProducto: boolean;
    nombreProducto: boolean;
    familiaProducto: boolean;
  }>({
    idProducto: false,
    nombreProducto: false,
    familiaProducto: false,
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
    fetchAndSetProductos(filtrosParseados, lastOffset);
  };

  const handleSiguiente = () => {
    if (nextOffset === null) return;
    fetchAndSetProductos(filtrosParseados, nextOffset);
  };

  const goToPage = (pageNumber: number) => {
    const goToPageOffset = pageNumber * limit - limit;
    fetchAndSetProductos(setFetchBody(), goToPageOffset);
  };

  const handleFiltroChange = (campo: string, valor: string) => {
    setFiltros((prev) => ({ ...prev, [campo]: valor }));

    const limites: Record<string, number> = {
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
    const body: { where: Record<string, any>; order?: Record<string, any> } = {
      where: {},
    };

    if (filtros.idProducto)
      body.where.id_producto = { like: filtros.idProducto };
    if (filtros.nombreProducto)
      body.where.nombre_producto = { like: filtros.nombreProducto };
    if (filtros.familiaProducto)
      body.where.familia_producto = { like: filtros.familiaProducto };

    return body;
  };

  const fetchAndSetProductos = async (
    body: Record<string, any>,
    newOffset = 0
  ) => {
    let finalBody: { where: Record<string, any>; order?: Record<string, any> } =
      { ...body, where: { ...body?.where } };
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
    } catch (error: any) {
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

  const handleRowClick = async (registro: Producto, no_item: number) => {
    if (!isUserAdmin) return;
    setProductoToDelete(registro);
    setProductoToDeleteNoItem(no_item);
  };

  const pipeRowValue = (
    col: string,
    registro: Producto,
    index: number,
    offset: number
  ) => {
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
    } catch (error: any) {
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
    //   setFamilias(dataFamilias || []);
    // };
    // cargarFamilias();
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
          actualPage={actualPage ?? 1}
          totalPages={totalPages ?? 1}
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
            <Button variant="secondary" size="lg" onClick={resetFiltros}>
              {i18n.verProductos.borrarCamposBtn}
            </Button>
            <Button
              variant="warning"
              size="lg"
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

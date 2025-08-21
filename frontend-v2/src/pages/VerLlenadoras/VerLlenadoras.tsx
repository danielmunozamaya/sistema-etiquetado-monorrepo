import { useState, useEffect, useRef } from "react";
import "../../modales-bootstrap.css";
import "./VerLlenadoras.css";
import { Button, Modal } from "react-bootstrap";
import { activateToast } from "../../components/ToastMessage/helpers/ToastMessage.helpers";
import { queryLlenadoras, deleteLlenadora } from "./services/VerLlenadoras";
import HorizontalScrollTable from "../../components/HorizontalScrollTable/HorizontalScrollTable";
import Paginator from "../../components/Paginator/Paginator";
import {
  TABLE_ROWS_LIMIT,
  USER_ROLE,
} from "../../common/constants/shared.constants";
import { i18n } from "../../i18n";

interface Llenadora {
  id: string | number;
  id_llenadora: string;
  nombre_llenadora: string;
  observaciones?: string;
  [key: string]: any;
}

interface VerLlenadorasProps {
  userRole: string;
}

const columnasDisponibles = [
  "Nº_de_ítem",
  "id_llenadora",
  "nombre_llenadora",
  "observaciones",
];

const columnasBeautify: Record<string, string> = {
  Nº_de_ítem: i18n.verLlenadoras.colItem,
  id_llenadora: i18n.verLlenadoras.colIdLlenadora,
  nombre_llenadora: i18n.verLlenadoras.colNombreLlenadora,
  observaciones: i18n.verLlenadoras.colObservaciones,
};

const beautify = (text: string) => columnasBeautify[text];

const VerLlenadoras: React.FC<VerLlenadorasProps> = ({ userRole }) => {
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
  const [registros, setRegistros] = useState<Llenadora[]>([]);
  const [filtrosParseados, setFiltrosParseados] = useState<Record<string, any>>(
    {}
  );
  const [llenadoraToDelete, setLlenadoraToDelete] = useState<Llenadora | null>(
    null
  );
  const [llenadoraToDeleteNoItem, setLlenadoraToDeleteNoItem] = useState<
    number | null
  >(null);
  const isUserAdmin = userRole === USER_ROLE.ADMINISTRADOR;

  const [filtros, setFiltros] = useState({
    idLlenadora: "",
    nombreLlenadora: "",
  });
  const [erroresFiltros, setErroresFiltros] = useState({
    idLlenadora: false,
    nombreLlenadora: false,
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
    fetchAndSetLlenadoras(filtrosParseados, lastOffset);
  };

  const handleSiguiente = () => {
    if (nextOffset === null) return;
    fetchAndSetLlenadoras(filtrosParseados, nextOffset);
  };

  const goToPage = (pageNumber: number) => {
    const goToPageOffset = pageNumber * limit - limit;
    fetchAndSetLlenadoras(setFetchBody(), goToPageOffset);
  };

  const handleFiltroChange = (campo: string, valor: string) => {
    setFiltros((prev) => ({ ...prev, [campo]: valor }));

    const limites: Record<string, number> = {
      idLlenadora: 2,
      nombreLlenadora: 50,
    };

    setErroresFiltros((prev) => ({
      ...prev,
      [campo]: valor.length > limites[campo],
    }));
  };

  const resetFiltros = () => {
    setFiltros({
      idLlenadora: "",
      nombreLlenadora: "",
    });
    setFiltrosParseados({});
  };

  const setFetchBody = () => {
    const body: { where: Record<string, any>; order?: Record<string, any> } = {
      where: {},
    };

    if (filtros.idLlenadora)
      body.where.id_llenadora = { like: filtros.idLlenadora };
    if (filtros.nombreLlenadora)
      body.where.nombre_llenadora = { like: filtros.nombreLlenadora };

    return body;
  };

  const fetchAndSetLlenadoras = async (
    body: Record<string, any>,
    newOffset = 0
  ) => {
    let finalBody: { where: Record<string, any>; order?: Record<string, any> } =
      { ...body, where: { ...body?.where } };
    finalBody.where.visible = { eq: true };
    finalBody.order = { id_llenadora: "ASC" };
    try {
      const data = await queryLlenadoras(finalBody, {
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
      console.error("Error al cargar llenadoras:", error.message);
    }
  };

  const handleAplicarFiltros = () => {
    if (Object.values(erroresFiltros).some((e) => e)) return;

    const body = setFetchBody();

    setFiltrosParseados(body);
    setShowFiltros(false);
    fetchAndSetLlenadoras(body, 0);
  };

  const handleRowClick = (registro: Llenadora, no_item: number) => {
    if (!isUserAdmin) return;
    setLlenadoraToDelete(registro);
    setLlenadoraToDeleteNoItem(no_item);
  };

  const pipeRowValue = (
    col: string,
    registro: Llenadora,
    index: number,
    offset: number
  ) => {
    return col === "Nº_de_ítem" ? index + offset + 1 : registro[col] ?? "";
  };

  const cancelarBaja = () => {
    setLlenadoraToDelete(null);
    setLlenadoraToDeleteNoItem(null);
  };

  const confirmarBaja = async () => {
    if (!llenadoraToDelete) return;
    try {
      await deleteLlenadora(llenadoraToDelete.id);
      setLlenadoraToDelete(null);
      setLlenadoraToDeleteNoItem(null);
      activateToast({
        message: i18n.verLlenadoras.successEliminarLlenadora,
        type: "success",
      });
      fetchAndSetLlenadoras(filtrosParseados, offset);
    } catch (error: any) {
      activateToast({
        message: error.message || i18n.verLlenadoras.errorEliminarLlenadora,
        type: "danger",
      });
    }
  };

  useEffect(() => {
    fetchAndSetLlenadoras(filtrosParseados, offset);
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
      <div className="d-flex justify-content-between align-items-center mb-3 position-relative">
        <Button
          variant="outline-warning"
          size="sm"
          onClick={() => setShowModal(true)}
        >
          {i18n.verLlenadoras.columnasBtn}
        </Button>
        <div className="position-absolute top-50 start-50 translate-middle">
          <Button
            variant="warning"
            size="sm"
            onClick={() => setShowFiltros(true)}
          >
            {i18n.verLlenadoras.filtrosBtn}
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
          <Modal.Title>{i18n.verLlenadoras.columnasModalTitle}</Modal.Title>
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
            <Modal.Title>{i18n.verLlenadoras.filtrosModalTitle}</Modal.Title>
          </Modal.Header>
          <div className="modal-bootstrap-body">
            <form className="modal-bootstrap-form">
              <div className="form-group">
                <label className="form-label">
                  {i18n.verLlenadoras.idLlenadoraLabel}
                </label>
                <input
                  type="text"
                  className={`form-control form-control-sm ${
                    erroresFiltros.idLlenadora ? "is-invalid" : ""
                  }`}
                  value={filtros.idLlenadora}
                  onChange={(e) =>
                    handleFiltroChange("idLlenadora", e.target.value)
                  }
                />
                <div className="invalid-feedback">
                  {i18n.verLlenadoras.idLlenadoraInvalid}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">
                  {i18n.verLlenadoras.nombreLlenadoraLabel}
                </label>
                <input
                  type="text"
                  className={`form-control form-control-sm ${
                    erroresFiltros.nombreLlenadora ? "is-invalid" : ""
                  }`}
                  value={filtros.nombreLlenadora}
                  onChange={(e) =>
                    handleFiltroChange("nombreLlenadora", e.target.value)
                  }
                />
                <div className="invalid-feedback">
                  {i18n.verLlenadoras.nombreLlenadoraInvalid}
                </div>
              </div>
            </form>
          </div>
          <div className="modal-bootstrap-footer">
            <Button variant="secondary" size="lg" onClick={resetFiltros}>
              {i18n.verLlenadoras.borrarCamposBtn}
            </Button>
            <Button
              variant="warning"
              size="lg"
              onClick={handleAplicarFiltros}
              ref={aplicarFiltrosBtnRef}
            >
              {i18n.verLlenadoras.aplicarFiltrosBtn}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        show={!!llenadoraToDelete}
        onHide={cancelarBaja}
        centered
        dialogClassName="modal-bootstrap-dialog"
      >
        <div className="modal-bootstrap-content">
          <Modal.Header closeButton>
            <Modal.Title>{i18n.verLlenadoras.eliminarModalTitle}</Modal.Title>
          </Modal.Header>
          <div className="modal-bootstrap-body">
            <p className="mb-3">
              {i18n.verLlenadoras.eliminarConfirmMsg}{" "}
              <strong>{llenadoraToDeleteNoItem || ""}</strong>?
            </p>
          </div>
          <div className="modal-bootstrap-footer">
            <Button variant="secondary" onClick={cancelarBaja}>
              {i18n.verLlenadoras.cancelarBtn}
            </Button>
            <Button variant="danger" onClick={confirmarBaja}>
              {i18n.verLlenadoras.confirmarEliminarBtn}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default VerLlenadoras;

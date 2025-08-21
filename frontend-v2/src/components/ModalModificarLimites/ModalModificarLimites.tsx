import { useState, useEffect, useRef } from "react";
import "../../modales.css";
import "./ModalModificarLimites.css";
import {
  fetchAsociacionesProduccion,
  updateLimit,
} from "./services/ModalModificarLimites";
import { activateToast } from "../ToastMessage/helpers/ToastMessage.helpers";
import { i18n } from "../../i18n";

interface Formulario {
  idLlenadora: string;
  idCabezal: string;
  limiteLlenado: string;
}

interface Llenadora {
  id_llenadora: string;
  nombre_llenadora: string;
  cabezales: Cabezal[];
}

interface Cabezal {
  id: string;
  id_cabezal: string;
}

interface AsociacionProduccion {
  id: string;
  uuid_cabezal: string;
  limite_llenado?: number;
  llenadora: Llenadora;
}

const ModalModificarLimites: React.FC = () => {
  const modificarLimiteBtnRef = useRef<HTMLButtonElement>(null);
  const [formulario, setFormulario] = useState<Formulario>({
    idLlenadora: "",
    idCabezal: "",
    limiteLlenado: "",
  });
  const [asociacionesProduccion, setAsociacionesProduccion] = useState<
    AsociacionProduccion[]
  >([]);
  const [llenadoras, setLlenadoras] = useState<Llenadora[]>([]);
  const [cabezales, setCabezales] = useState<Cabezal[]>([]);
  const [idCabezalSeleccionado, setIdCabezalSeleccionado] =
    useState<string>("");
  const [idAsociacionSeleccionada, setIdAsociacionSeleccionada] =
    useState<string>("");
  const [limiteLlenado, setLimiteLlenado] = useState<number | null>(null);
  const [errorLimite, setErrorLimite] = useState(false);

  const handleChange = (campo: keyof Formulario, valor: string) => {
    setFormulario((prev) => ({ ...prev, [campo]: valor }));

    if (campo === "idLlenadora") {
      setFormulario((prev) => ({ ...prev, idCabezal: "", limiteLlenado: "" }));
      setCabezales([]);
      setIdAsociacionSeleccionada("");
      setIdCabezalSeleccionado("");
      setLimiteLlenado(null);

      const asociacion = asociacionesProduccion.find(
        (a) => a.llenadora.id_llenadora === valor
      );

      if (asociacion) {
        setCabezales(asociacion.llenadora.cabezales || []);
      }
    }

    if (campo === "idCabezal") {
      const cabezalTarget = cabezales.find((c) => c.id_cabezal === valor);
      setIdAsociacionSeleccionada("");
      setIdCabezalSeleccionado(cabezalTarget?.id || "");
      setFormulario((prev) => ({ ...prev, limiteLlenado: "" }));
      setLimiteLlenado(null);
    }

    if (campo === "limiteLlenado") {
      const valorNumerico = parseInt(valor);
      const error =
        isNaN(valorNumerico) || valorNumerico < 1 || valorNumerico > 999;

      setErrorLimite(error);
      setFormulario((prev) => ({ ...prev, limiteLlenado: valor }));
      setLimiteLlenado(valorNumerico);
    }
  };

  const updateAsociacionLimit = async (
    limite_llenado: number | null,
    id_asociacion_seleccionada: string
  ) => {
    try {
      await updateLimit({ limite_llenado }, id_asociacion_seleccionada);
      activateToast({
        message: i18n.modalModificarLimites.successActualizarLimite,
        type: "success",
      });
    } catch (error: any) {
      activateToast({
        message:
          error.message || i18n.modalModificarLimites.errorActualizarLimite,
        type: "danger",
      });
    }
  };

  const handleActualizar = async () => {
    if (errorLimite || !formulario.limiteLlenado) return;

    if (
      !formulario.idLlenadora ||
      !formulario.idCabezal ||
      !formulario.limiteLlenado
    )
      return;

    await updateAsociacionLimit(limiteLlenado, idAsociacionSeleccionada);
    await cargarAsociacionesProduccion();
    handleClose();
  };

  const handleClose = () => {
    const modal = document.getElementById("ModalModificarLimites");
    // @ts-ignore
    const modalInstance = window.bootstrap.Modal.getInstance(modal);
    if (modalInstance) modalInstance.hide();
    setTimeout(() => {
      setFormulario({ idLlenadora: "", idCabezal: "", limiteLlenado: "" });
      setErrorLimite(false);
    }, 500);
  };

  const cargarAsociacionesProduccion = async () => {
    try {
      const dataAsociacionesProduccion = await fetchAsociacionesProduccion();
      setAsociacionesProduccion(dataAsociacionesProduccion);
    } catch (error: any) {
      console.log(
        "Error al cargar asociaciones de producción: ",
        error.message
      );
    }
  };

  useEffect(() => {
    const modal = document.getElementById("ModalModificarLimites");
    const onModalOpen = () => {
      cargarAsociacionesProduccion();
    };

    if (modal) {
      modal.addEventListener("shown.bs.modal", onModalOpen);
    }

    return () => {
      if (modal) {
        modal.removeEventListener("shown.bs.modal", onModalOpen);
      }
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        const modal = document.getElementById("ModalModificarLimites");
        const isVisible = modal?.classList.contains("show");

        if (isVisible) {
          e.preventDefault();
          modificarLimiteBtnRef.current?.click();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (!asociacionesProduccion.length) return;

    const llenadorasUnicas: Llenadora[] = [];
    const idsRegistrados = new Set<string>();

    asociacionesProduccion.forEach((asoc) => {
      const { id_llenadora, nombre_llenadora, cabezales } = asoc.llenadora;

      if (!idsRegistrados.has(id_llenadora)) {
        idsRegistrados.add(id_llenadora);
        llenadorasUnicas.push({ id_llenadora, nombre_llenadora, cabezales });
      }
    });

    setLlenadoras(llenadorasUnicas);
  }, [asociacionesProduccion]);

  useEffect(() => {
    if (!formulario.idLlenadora || !idCabezalSeleccionado) return;

    const asociacionTarget = asociacionesProduccion.find(
      (a) => a.uuid_cabezal === idCabezalSeleccionado
    );
    setIdAsociacionSeleccionada(asociacionTarget?.id || "");

    if (asociacionTarget) {
      const limite = asociacionTarget.limite_llenado;
      setLimiteLlenado(typeof limite === "number" ? limite : null);
      setFormulario((prev) => ({
        ...prev,
        limiteLlenado: typeof limite === "number" ? limite.toString() : "",
      }));
    }
  }, [
    formulario.idLlenadora,
    formulario.idCabezal,
    idCabezalSeleccionado,
    asociacionesProduccion,
  ]);

  return (
    <div
      className="modal fade modal-unificado"
      id="ModalModificarLimites"
      tabIndex={-1}
      aria-hidden="true"
    >
      <div className="modal-dialog modal-dialog-centered modal-md">
        <div className="modal-content">
          {/* Header */}
          <div className="modal-header">
            <h5 className="modal-title">{i18n.modalModificarLimites.title}</h5>
            <button
              type="button"
              className="btn-close"
              onClick={handleClose}
            ></button>
          </div>

          {/* Body con scroll */}
          <div className="modal-body">
            <form
              id="formModificarLimite"
              className="filtros-form-columna"
              noValidate
            >
              <div className="C-CM1-form-group">
                <label className="form-label">
                  {i18n.modalModificarLimites.idLlenadoraLabel}
                </label>
                <select
                  className="form-select form-select-sm"
                  value={formulario.idLlenadora}
                  onChange={(e) => handleChange("idLlenadora", e.target.value)}
                >
                  <option value="">
                    {i18n.modalModificarLimites.selectLlenadora}
                  </option>
                  {llenadoras.map((l) => (
                    <option key={l.id_llenadora} value={l.id_llenadora}>
                      {l.nombre_llenadora}
                    </option>
                  ))}
                </select>
              </div>

              <div className="C-CM1-form-group">
                <label className="form-label">
                  {i18n.modalModificarLimites.idCabezalLabel}
                </label>
                <select
                  className="form-select form-select-sm"
                  value={formulario.idCabezal}
                  onChange={(e) => handleChange("idCabezal", e.target.value)}
                >
                  <option value="">
                    {i18n.modalModificarLimites.selectCabezal}
                  </option>
                  {cabezales.map((c) => (
                    <option key={c.id} value={c.id_cabezal}>
                      {c.id_cabezal}
                    </option>
                  ))}
                </select>
              </div>

              <div className="C-CM1-form-group">
                <label className="form-label">
                  {i18n.modalModificarLimites.limiteLlenadoLabel}
                </label>
                <input
                  type="number"
                  min={1}
                  max={999}
                  className={`form-control form-control-sm text-start ${
                    errorLimite ? "is-invalid" : ""
                  }`}
                  value={formulario.limiteLlenado}
                  onChange={(e) =>
                    handleChange("limiteLlenado", e.target.value)
                  }
                />
                <div className="invalid-feedback">
                  {i18n.modalModificarLimites.limiteLlenadoInvalid}
                </div>
              </div>
            </form>
          </div>

          {/* Footer fijo */}
          <div className="modal-footer d-flex justify-content-between gap-3">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleClose}
            >
              {i18n.modalModificarLimites.cancelarBtn}
            </button>
            <button
              type="button"
              className="btn btn-warning"
              onClick={handleActualizar}
              ref={modificarLimiteBtnRef}
            >
              {i18n.modalModificarLimites.modificarBtn}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalModificarLimites;

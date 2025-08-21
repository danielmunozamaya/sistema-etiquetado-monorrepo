import { useState, useEffect, useRef } from "react";
import "../../../modales.css";
import { activateToast } from "../../ToastMessage/helpers/ToastMessage.helpers";
import { crearLlenadora } from "./services/ModalCrearLlenadora";
import { i18n } from "../../../i18n";

interface CabezalForm {
  nombre: string;
  ruta_impresion: string;
}

interface LlenadoraForm {
  id: string;
  nombre: string;
  tipo: "doble" | "triple";
  cabezales: {
    A: CabezalForm;
    B: CabezalForm;
    C: CabezalForm;
  };
}

const ModalCrearLlenadora: React.FC = () => {
  const ModalCrearLlenadoraBtnRef = useRef<HTMLButtonElement>(null);
  const [validated, setValidated] = useState(false);

  const [llenadora, setLlenadora] = useState<LlenadoraForm>({
    id: "",
    nombre: "",
    tipo: "doble",
    cabezales: {
      A: { nombre: "", ruta_impresion: "" },
      B: { nombre: "", ruta_impresion: "" },
      C: { nombre: "", ruta_impresion: "" },
    },
  });

  const handleChange = (campo: keyof LlenadoraForm, valor: string) => {
    setLlenadora((prev) => ({ ...prev, [campo]: valor }));
  };

  const handleCabezalChange = (
    id: "A" | "B" | "C",
    campo: keyof CabezalForm,
    valor: string
  ) => {
    setLlenadora((prev) => ({
      ...prev,
      cabezales: {
        ...prev.cabezales,
        [id]: {
          ...prev.cabezales[id],
          [campo]: valor,
        },
      },
    }));
  };

  const handleCrear = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;

    if (!form.checkValidity()) {
      setValidated(true);
      return;
    }

    const body = {
      id_llenadora: llenadora.id,
      nombre_llenadora: llenadora.nombre,
      cabezales: [],
    } as {
      id_llenadora: string;
      nombre_llenadora: string;
      cabezales: Array<{
        id_llenadora: string;
        id_cabezal: string;
        nombre_cabezal: string;
        ruta_impresion: string;
      }>;
    };

    const cabezalesKeys =
      llenadora.tipo === "doble" ? ["A", "B"] : ["A", "B", "C"];

    for (const id of cabezalesKeys as Array<"A" | "B" | "C">) {
      body.cabezales.push({
        id_llenadora: llenadora.id,
        id_cabezal: id,
        nombre_cabezal: llenadora.cabezales[id].nombre,
        ruta_impresion: llenadora.cabezales[id].ruta_impresion,
      });
    }

    try {
      await crearLlenadora(body);
      activateToast({
        message: i18n.modalCrearLlenadora.successCrearLlenadora,
        type: "success",
      });
      resetForm();
    } catch (error: any) {
      activateToast({
        message: error.message || i18n.modalCrearLlenadora.errorCrearLlenadora,
        type: "danger",
      });
    }
  };

  const resetForm = () => {
    setLlenadora({
      id: "",
      nombre: "",
      tipo: "doble",
      cabezales: {
        A: { nombre: "", ruta_impresion: "" },
        B: { nombre: "", ruta_impresion: "" },
        C: { nombre: "", ruta_impresion: "" },
      },
    });
    setValidated(false);
  };

  const handleClose = () => {
    const modal = document.getElementById("ModalCrearLlenadora");
    // @ts-ignore
    const modalInstance = window.bootstrap.Modal.getOrCreateInstance(modal);
    modalInstance.hide();
    setTimeout(() => {
      resetForm();
    }, 500);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        const modal = document.getElementById("ModalCrearLlenadora");
        const isVisible = modal?.classList.contains("show");

        if (isVisible) {
          e.preventDefault();
          ModalCrearLlenadoraBtnRef.current?.click();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const cabezalesVisibles =
    llenadora.tipo === "doble" ? ["A", "B"] : ["A", "B", "C"];

  return (
    <>
      <div
        className="modal fade modal-unificado"
        id="ModalCrearLlenadora"
        tabIndex={-1}
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered modal-md">
          <div className="modal-content">
            {/* Header fijo */}
            <div className="modal-header">
              <h5 className="modal-title">{i18n.modalCrearLlenadora.title}</h5>
              <button
                type="button"
                className="btn-close"
                onClick={handleClose}
              ></button>
            </div>

            {/* Scroll interno solo aquí */}
            <div className="modal-body">
              <form
                id="ModalCrearLlenadoraForm"
                className={`filtros-form-columna ${
                  validated ? "was-validated" : ""
                }`}
                noValidate
                onSubmit={handleCrear}
              >
                <div className="C-CM1-form-group">
                  <label className="form-label">
                    {i18n.modalCrearLlenadora.idLabel}
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    required
                    minLength={2}
                    maxLength={2}
                    value={llenadora.id}
                    onChange={(e) => handleChange("id", e.target.value)}
                  />
                  <div className="invalid-feedback">
                    {i18n.modalCrearLlenadora.idInvalid}
                  </div>
                </div>

                <div className="C-CM1-form-group">
                  <label className="form-label">
                    {i18n.modalCrearLlenadora.nombreLabel}
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    required
                    maxLength={50}
                    value={llenadora.nombre}
                    onChange={(e) => handleChange("nombre", e.target.value)}
                  />
                  <div className="invalid-feedback">
                    {i18n.modalCrearLlenadora.nombreInvalid}
                  </div>
                </div>

                <div className="C-CM1-form-group">
                  <label className="form-label">
                    {i18n.modalCrearLlenadora.tipoLabel}
                  </label>
                  <select
                    className="form-select form-select-sm"
                    value={llenadora.tipo}
                    onChange={(e) => handleChange("tipo", e.target.value)}
                    required
                  >
                    <option value="doble">
                      {i18n.modalCrearLlenadora.tipoDoble}
                    </option>
                    <option value="triple">
                      {i18n.modalCrearLlenadora.tipoTriple}
                    </option>
                  </select>
                </div>

                <hr />
                {cabezalesVisibles.map((id) => (
                  <div key={id} className="mb-3">
                    <h6 className="fw-bold">
                      {i18n.modalCrearLlenadora.cabezalLabel} {id}
                    </h6>
                    <div className="C-CM1-form-group">
                      <label className="form-label">
                        {i18n.modalCrearLlenadora.idCabezalLabel}
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={id}
                        disabled
                      />
                    </div>
                    <div className="C-CM1-form-group">
                      <label className="form-label">
                        {i18n.modalCrearLlenadora.nombreCabezalLabel}
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        required
                        maxLength={50}
                        value={
                          llenadora.cabezales[id as "A" | "B" | "C"].nombre
                        }
                        onChange={(e) =>
                          handleCabezalChange(
                            id as "A" | "B" | "C",
                            "nombre",
                            e.target.value
                          )
                        }
                      />
                      <div className="invalid-feedback">
                        {i18n.modalCrearLlenadora.nombreCabezalInvalid}
                      </div>
                    </div>
                    <div className="C-CM1-form-group">
                      <label className="form-label">
                        {i18n.modalCrearLlenadora.rutaImpresionLabel}
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        required
                        maxLength={50}
                        value={
                          llenadora.cabezales[id as "A" | "B" | "C"]
                            .ruta_impresion
                        }
                        onChange={(e) =>
                          handleCabezalChange(
                            id as "A" | "B" | "C",
                            "ruta_impresion",
                            e.target.value
                          )
                        }
                      />
                      <div className="invalid-feedback">
                        {i18n.modalCrearLlenadora.rutaImpresionInvalid}
                      </div>
                    </div>
                  </div>
                ))}
              </form>
            </div>

            {/* Footer fijo con botones */}
            <div className="modal-footer d-flex justify-content-between gap-3">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={resetForm}
              >
                {i18n.modalCrearLlenadora.borrarCamposBtn}
              </button>
              <button
                type="submit"
                className="btn btn-warning"
                ref={ModalCrearLlenadoraBtnRef}
                form="ModalCrearLlenadoraForm"
              >
                {i18n.modalCrearLlenadora.crearBtn}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ModalCrearLlenadora;

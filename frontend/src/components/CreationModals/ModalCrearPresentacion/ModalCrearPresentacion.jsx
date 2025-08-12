import { useState, useEffect, useRef } from "react";
import "../../../modales.css";
import { activateToast } from "../../ToastMessage/helpers/ToastMessage.helpers";
import { crearPresentacion } from "./services/ModalCrearPresentacion";
import { i18n } from "../../../i18n";

const ModalCrearPresentacion = () => {
  const modalCrearPresentacionBtnRef = useRef(null);
  const [presentacion, setPresentacion] = useState({
    id: "",
    nombre: "",
    pesoNeto: "",
    pesoBruto: "",
  });

  const [validated, setValidated] = useState(false);

  const handleChange = (campo, valor) => {
    setPresentacion((prev) => ({ ...prev, [campo]: valor }));
  };

  const resetForm = () => {
    setPresentacion({
      id: "",
      nombre: "",
      pesoNeto: "",
      pesoBruto: "",
    });
    setValidated(false);
  };

  const handleCrear = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;

    if (!form.checkValidity()) {
      setValidated(true);
      return;
    }

    try {
      await crearPresentacion({
        id_presentacion: presentacion.id,
        nombre_presentacion: presentacion.nombre,
        peso_neto: parseFloat(presentacion.pesoNeto),
        peso_bruto: parseFloat(presentacion.pesoBruto),
      });
      activateToast({
        message: i18n.modalCrearPresentacion.successCrearPresentacion,
        type: "success",
      });
      resetForm();
    } catch (error) {
      activateToast({
        message:
          error.message || i18n.modalCrearPresentacion.errorCrearPresentacion,
        type: "danger",
      });
    }
  };

  const handleClose = () => {
    const modal = document.getElementById("modalCrearPresentacion");
    const modalInstance = bootstrap.Modal.getOrCreateInstance(modal);
    modalInstance.hide();
    setTimeout(() => {
      resetForm();
    }, 500);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Enter") {
        const modal = document.getElementById("modalCrearPresentacion");
        const isVisible = modal?.classList.contains("show");

        if (isVisible) {
          e.preventDefault();
          modalCrearPresentacionBtnRef.current?.click();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div
      className="modal fade modal-unificado"
      id="modalCrearPresentacion"
      tabIndex="-1"
      aria-hidden="true"
    >
      <div className="modal-dialog modal-dialog-centered modal-md">
        <div className="modal-content">
          {/* Header */}
          <div className="modal-header">
            <h5 className="modal-title">{i18n.modalCrearPresentacion.title}</h5>
            <button
              type="button"
              className="btn-close"
              onClick={handleClose}
            ></button>
          </div>

          {/* Body con scroll */}
          <div className="modal-body">
            <form
              id="modalCrearPresentacionForm"
              className={`filtros-form-columna ${
                validated ? "was-validated" : ""
              }`}
              noValidate
              onSubmit={handleCrear}
            >
              <div className="C-CM1-form-group">
                <label className="form-label">
                  {i18n.modalCrearPresentacion.idLabel}
                </label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  required
                  minLength={1}
                  maxLength={15}
                  value={presentacion.id}
                  onChange={(e) => handleChange("id", e.target.value)}
                />
                <div className="invalid-feedback">
                  {i18n.modalCrearPresentacion.idInvalid}
                </div>
              </div>

              <div className="C-CM1-form-group">
                <label className="form-label">
                  {i18n.modalCrearPresentacion.nombreLabel}
                </label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  required
                  minLength={1}
                  maxLength={200}
                  value={presentacion.nombre}
                  onChange={(e) => handleChange("nombre", e.target.value)}
                />
                <div className="invalid-feedback">
                  {i18n.modalCrearPresentacion.nombreInvalid}
                </div>
              </div>

              <div className="C-CM1-form-group">
                <label className="form-label">
                  {i18n.modalCrearPresentacion.pesoNetoLabel}
                </label>
                <input
                  type="number"
                  className="form-control form-control-sm"
                  required
                  min={0.0}
                  max={99999.99}
                  step={0.01}
                  value={presentacion.pesoNeto}
                  onChange={(e) => handleChange("pesoNeto", e.target.value)}
                />
                <div className="invalid-feedback">
                  {i18n.modalCrearPresentacion.pesoNetoInvalid}
                </div>
              </div>

              <div className="C-CM1-form-group">
                <label className="form-label">
                  {i18n.modalCrearPresentacion.pesoBrutoLabel}
                </label>
                <input
                  type="number"
                  className="form-control form-control-sm"
                  required
                  min={0.0}
                  max={99999.99}
                  step={0.01}
                  value={presentacion.pesoBruto}
                  onChange={(e) => handleChange("pesoBruto", e.target.value)}
                />
                <div className="invalid-feedback">
                  {i18n.modalCrearPresentacion.pesoBrutoInvalid}
                </div>
              </div>
            </form>
          </div>

          {/* Footer fijo */}
          <div className="modal-footer d-flex justify-content-between gap-3">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={resetForm}
            >
              {i18n.modalCrearPresentacion.borrarCamposBtn}
            </button>
            <button
              type="submit"
              className="btn btn-warning"
              ref={modalCrearPresentacionBtnRef}
              form="modalCrearPresentacionForm"
            >
              {i18n.modalCrearPresentacion.crearBtn}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalCrearPresentacion;

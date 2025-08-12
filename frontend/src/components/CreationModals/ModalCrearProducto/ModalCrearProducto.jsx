import { useState, useEffect, useRef } from "react";
import "../../../modales.css";
import { activateToast } from "../../ToastMessage/helpers/ToastMessage.helpers";
import { crearProducto } from "./services/ModalCrearProducto";
import { i18n } from "../../../i18n";

const ModalCrearProducto = () => {
  const modalCrearProductoBtnRef = useRef(null);
  const [producto, setProducto] = useState({
    id: "",
    nombre: "",
    familia: "",
  });

  const [validated, setValidated] = useState(false);

  const handleChange = (campo, valor) => {
    setProducto((prev) => ({ ...prev, [campo]: valor }));
  };

  const resetForm = () => {
    setProducto({ id: "", nombre: "", familia: "" });
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
      await crearProducto({
        id_producto: producto.id,
        nombre_producto: producto.nombre,
        familia_producto: producto.familia,
      });
      activateToast({
        message: i18n.modalCrearProducto.successCrearProducto,
        type: "success",
      });
      resetForm();
    } catch (error) {
      activateToast({
        message: error.message || i18n.modalCrearProducto.errorCrearProducto,
        type: "danger",
      });
    }
  };

  const handleClose = () => {
    const modal = document.getElementById("modalCrearProducto");
    const modalInstance = bootstrap.Modal.getOrCreateInstance(modal);
    modalInstance.hide();
    setTimeout(() => {
      resetForm();
    }, 500);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Enter") {
        const modal = document.getElementById("modalCrearProducto");
        const isVisible = modal?.classList.contains("show");

        if (isVisible) {
          e.preventDefault();
          modalCrearProductoBtnRef.current?.click();
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
      id="modalCrearProducto"
      tabIndex="-1"
      aria-hidden="true"
    >
      <div className="modal-dialog modal-dialog-centered modal-md">
        <div className="modal-content">
          {/* Header */}
          <div className="modal-header">
            <h5 className="modal-title">{i18n.modalCrearProducto.title}</h5>
            <button
              type="button"
              className="btn-close"
              onClick={handleClose}
            ></button>
          </div>

          {/* Body con scroll */}
          <div className="modal-body">
            <form
              id="modalCrearProductoForm"
              className={`filtros-form-columna ${
                validated ? "was-validated" : ""
              }`}
              noValidate
              onSubmit={handleCrear}
            >
              <div className="C-CM1-form-group">
                <label className="form-label">
                  {i18n.modalCrearProducto.idLabel}
                </label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  required
                  minLength={1}
                  maxLength={15}
                  value={producto.id}
                  onChange={(e) => handleChange("id", e.target.value)}
                />
                <div className="invalid-feedback">
                  {i18n.modalCrearProducto.idInvalid}
                </div>
              </div>

              <div className="C-CM1-form-group">
                <label className="form-label">
                  {i18n.modalCrearProducto.nombreLabel}
                </label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  required
                  minLength={1}
                  maxLength={200}
                  value={producto.nombre}
                  onChange={(e) => handleChange("nombre", e.target.value)}
                />
                <div className="invalid-feedback">
                  {i18n.modalCrearProducto.nombreInvalid}
                </div>
              </div>

              <div className="C-CM1-form-group">
                <label className="form-label">
                  {i18n.modalCrearProducto.familiaLabel}
                </label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  required
                  minLength={1}
                  maxLength={200}
                  value={producto.familia}
                  onChange={(e) => handleChange("familia", e.target.value)}
                />
                <div className="invalid-feedback">
                  {i18n.modalCrearProducto.familiaInvalid}
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
              {i18n.modalCrearProducto.borrarCamposBtn}
            </button>
            <button
              type="submit"
              className="btn btn-warning"
              ref={modalCrearProductoBtnRef}
              form="modalCrearProductoForm"
            >
              {i18n.modalCrearProducto.crearBtn}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalCrearProducto;

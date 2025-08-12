import { useRef, useState, useEffect } from "react";
import "../../modales.css";
import { i18n } from "../../i18n";

const CustommizeLlenadoraModal = ({
  nombre_llenadora,
  formFieldsValue,
  setFormFieldsFn,
  handleEraseFieldsFn,
  handleSetConfigurationFn,
  closeModalFn,
  formFieldsArray,
  modalRef,
}) => {
  const [errores, setErrores] = useState({});
  const formRef = useRef(null);

  const handleChange = (campo, valor) => {
    setFormFieldsFn((prev) => ({
      ...prev,
      [campo]: valor,
    }));

    // Limpiar error si vuelve a estar dentro del límite
    const isTitulo = campo.toLowerCase().includes("titulo");
    const max = isTitulo ? 100 : 200;

    setErrores((prev) => ({
      ...prev,
      [campo]: valor.length > max,
    }));
  };

  const validarCampos = () => {
    const nuevosErrores = {};

    formFieldsArray.forEach(({ id }) => {
      const isTitulo = id.toLowerCase().includes("titulo");
      const max = isTitulo ? 100 : 200;
      const value = formFieldsValue[id] || "";

      if (value.length > max) {
        nuevosErrores[id] = true;
      }
    });

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleAceptar = () => {
    if (!validarCampos()) return;
    handleSetConfigurationFn();
  };

  const handleCerrar = () => {
    closeModalFn();
    setTimeout(() => setErrores({}), 500);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Enter") {
        const isVisible = modalRef.current?.classList.contains("show");
        if (isVisible) {
          e.preventDefault();
          handleAceptar();
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div
      className="modal fade modal-unificado"
      tabIndex="-1"
      ref={modalRef}
      aria-hidden="true"
    >
      <div className="modal-dialog modal-dialog-centered modal-md">
        <div className="modal-content">
          {/* Header */}
          <div className="modal-header">
            <h5 className="modal-title">
              {i18n.customizeLlenadoraModal.title} {nombre_llenadora}
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={handleCerrar}
            ></button>
          </div>

          {/* Body */}
          <div className="modal-body">
            <form ref={formRef} className="filtros-form-columna" noValidate>
              {formFieldsArray.map(({ id, label }) => {
                const isTitulo = id.toLowerCase().includes("titulo");
                const max = isTitulo ? 100 : 200;
                const error = errores[id];

                return (
                  <div className="C-CM1-form-group" key={id}>
                    <label htmlFor={id} className="form-label fw-normal">
                      {label}
                    </label>
                    <input
                      type="text"
                      id={id}
                      className={`form-control form-control-sm ${
                        error ? "is-invalid" : ""
                      }`}
                      value={formFieldsValue[id] || ""}
                      onChange={(e) => handleChange(id, e.target.value)}
                    />
                    {error && (
                      <div className="invalid-feedback">
                        {isTitulo
                          ? i18n.customizeLlenadoraModal.tituloMaxInvalid
                          : i18n.customizeLlenadoraModal.valorMaxInvalid}
                      </div>
                    )}
                  </div>
                );
              })}
            </form>
          </div>

          {/* Footer */}
          <div className="modal-footer d-flex justify-content-between gap-3">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleEraseFieldsFn}
            >
              {i18n.customizeLlenadoraModal.borrarCamposBtn}
            </button>
            <button
              type="button"
              className="btn btn-warning"
              onClick={handleAceptar}
            >
              {i18n.customizeLlenadoraModal.aceptarBtn}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustommizeLlenadoraModal;

import { useState, useEffect, useRef } from "react";
import "../../../modales.css";
import { activateToast } from "../../ToastMessage/helpers/ToastMessage.helpers";
import {
  crearEan,
  fetchProductos,
  fetchPresentaciones,
} from "./services/ModalCrearEan";
import { i18n } from "../../../i18n";

const ModalCrearEan = () => {
  const [productos, setProductos] = useState([]);
  const [presentaciones, setPresentaciones] = useState([]);
  const modalCrearEanBtnRef = useRef(null);
  const [ean, setEan] = useState({
    codigo: "",
    idProducto: "",
    idPresentacion: "",
    diasBestBefore: "",
  });

  const [validated, setValidated] = useState(false);

  const handleChange = (campo, valor) => {
    setEan((prev) => ({ ...prev, [campo]: valor }));
  };

  const handleCrear = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;

    if (!form.checkValidity()) {
      setValidated(true);
      return;
    }

    try {
      await crearEan({
        codigo_ean: ean.codigo,
        id_producto: ean.idProducto,
        id_presentacion: ean.idPresentacion,
        dias_best_before: parseInt(ean.diasBestBefore),
      });
      activateToast({
        message: i18n.modalCrearEan.successCrearEan,
        type: "success",
      });
      resetForm();
    } catch (error) {
      activateToast({
        message: error.message || i18n.modalCrearEan.errorCrearEan,
        type: "danger",
      });
    }
  };

  const resetForm = () => {
    setEan({
      codigo: "",
      idProducto: "",
      idPresentacion: "",
      diasBestBefore: "",
    });
    setValidated(false);
  };

  const handleClose = () => {
    const modal = document.getElementById("modalCrearEan");
    const modalInstance = bootstrap.Modal.getOrCreateInstance(modal);
    modalInstance.hide();
    setTimeout(() => {
      resetForm();
    }, 500);
  };

  const fetchInitialData = async () => {
    try {
      const productos = await fetchProductos({});
      setProductos(productos);

      const presentaciones = await fetchPresentaciones({}, {});
      setPresentaciones(presentaciones);
    } catch (error) {
      activateToast({
        message: i18n.modalCrearEan.errorConsultarProductos,
        type: "danger",
      });
    }
  };

  useEffect(() => {
    const modal = document.getElementById("modalCrearEan");

    const handleShown = () => {
      fetchInitialData();
    };

    const handleKeyDown = (e) => {
      if (e.key === "Enter") {
        const modal = document.getElementById("modalCrearEan");
        const isVisible = modal?.classList.contains("show");

        if (isVisible) {
          e.preventDefault();
          modalCrearEanBtnRef.current?.click();
        }
      }
    };

    modal.addEventListener("shown.bs.modal", handleShown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      modal.removeEventListener("shown.bs.modal", handleShown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <>
      <div
        className="modal fade modal-unificado"
        id="modalCrearEan"
        tabIndex="-1"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered modal-md">
          <div className="modal-content">
            {/* Header fijo */}
            <div className="modal-header">
              <h5 className="modal-title">{i18n.modalCrearEan.title}</h5>
              <button
                type="button"
                className="btn-close"
                onClick={handleClose}
              ></button>
            </div>

            {/* Body con scroll */}
            <div className="modal-body">
              <form
                id="modalCrearEanForm"
                className={`filtros-form-columna ${
                  validated ? "was-validated" : ""
                }`}
                noValidate
                onSubmit={handleCrear}
              >
                <div className="C-CM1-form-group">
                  <label className="form-label">
                    {i18n.modalCrearEan.codigoLabel}
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    required
                    minLength={1}
                    maxLength={30}
                    value={ean.codigo}
                    onChange={(e) => handleChange("codigo", e.target.value)}
                  />
                  <div className="invalid-feedback">
                    {i18n.modalCrearEan.codigoInvalid}
                  </div>
                </div>

                <div className="C-CM1-form-group">
                  <label className="form-label">
                    {i18n.modalCrearEan.productoLabel}
                  </label>
                  <select
                    className="form-select form-select-sm"
                    required
                    value={ean.idProducto}
                    onChange={(e) => handleChange("idProducto", e.target.value)}
                  >
                    <option value="" disabled hidden>
                      {i18n.modalCrearEan.selectProducto}
                    </option>
                    {productos.map((producto) => (
                      <option key={producto.id} value={producto.id_producto}>
                        {producto.nombre_producto}
                      </option>
                    ))}
                  </select>
                  <div className="invalid-feedback">
                    {i18n.modalCrearEan.productoInvalid}
                  </div>
                </div>

                <div className="C-CM1-form-group">
                  <label className="form-label">
                    {i18n.modalCrearEan.presentacionLabel}
                  </label>
                  <select
                    className="form-select form-select-sm"
                    required
                    value={ean.idPresentacion}
                    onChange={(e) =>
                      handleChange("idPresentacion", e.target.value)
                    }
                  >
                    <option value="" disabled hidden>
                      {i18n.modalCrearEan.selectPresentacion}
                    </option>
                    {presentaciones.map((presentacion) => (
                      <option
                        key={presentacion.id}
                        value={presentacion.id_presentacion}
                      >
                        {presentacion.nombre_presentacion}
                      </option>
                    ))}
                  </select>
                  <div className="invalid-feedback">
                    {i18n.modalCrearEan.presentacionInvalid}
                  </div>
                </div>

                <div className="C-CM1-form-group">
                  <label className="form-label">
                    {i18n.modalCrearEan.diasBestBeforeLabel}
                  </label>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    required
                    min={1}
                    max={36500}
                    value={ean.diasBestBefore}
                    onChange={(e) =>
                      handleChange("diasBestBefore", e.target.value)
                    }
                  />
                  <div className="invalid-feedback">
                    {i18n.modalCrearEan.diasBestBeforeInvalid}
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
                {i18n.modalCrearEan.borrarCamposBtn}
              </button>
              <button
                type="submit"
                className="btn btn-warning"
                ref={modalCrearEanBtnRef}
                form="modalCrearEanForm"
              >
                {i18n.modalCrearEan.crearBtn}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ModalCrearEan;

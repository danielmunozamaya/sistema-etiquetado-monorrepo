import { useState, useEffect, useRef } from "react";
import "../../../modales.css";
import { activateToast } from "../../ToastMessage/helpers/ToastMessage.helpers";
import {
  fetchCabezales,
  fetchFamilias,
  fetchEans,
  fetchPresentaciones,
  fetchProductos,
  fetchAsociacionesProduccion,
  updateAsociacionProduccion,
} from "./services/ModalAsociacionProduccion"
import { i18n } from "../../../i18n";

interface FormData {
  idLlenadora: string;
  idCabezal: string;
  familiaProducto: string;
  idProducto: string;
  presentacion: string;
  codigoEan: string;
  rutaEtiqueta: string;
}

const defaultFormData: FormData = {
  idLlenadora: "",
  idCabezal: "",
  familiaProducto: "",
  idProducto: "",
  presentacion: "",
  codigoEan: "",
  rutaEtiqueta: "",
};

interface ModalAsociacionProduccionProps {
  isUserAdmin: boolean;
}

const ModalAsociacionProduccion: React.FC<ModalAsociacionProduccionProps> = ({
  isUserAdmin,
}) => {
  const ModalAsociacionProduccionBtnRef = useRef<HTMLButtonElement>(null);
  const [llenadoras, setLlenadoras] = useState<any[]>([]);
  const [cabezales, setCabezales] = useState<any[]>([]);
  const [familias, setFamilias] = useState<string[]>([]);
  const [productosLegacy, setProductosLegacy] = useState<any[]>([]);
  const [productos, setProductos] = useState<any[]>([]);
  const [presentacionesLegacy, setPresentacionesLegacy] = useState<any[]>([]);
  const [presentaciones, setPresentaciones] = useState<any[]>([]);
  const [eansLegacy, setEansLegacy] = useState<any[]>([]);
  const [eans, setEans] = useState<any[]>([]);
  const [formData, setFormData] = useState<FormData>(defaultFormData);
  const [idAsociacionSeleccionada, setIdAsociacionSeleccionada] = useState<
    string | null
  >(null);
  const [validated, setValidated] = useState(false);

  const setProductosByFamilia = (familia: string) => {
    const newProductos = productosLegacy.filter(
      (p) => p.familia_producto === familia
    );
    setProductos(
      newProductos.sort((a, b) =>
        a.nombre_producto.localeCompare(b.nombre_producto)
      )
    );
    return newProductos;
  };

  const setEansByProductos = (id_producto: string) => {
    const newEans = eansLegacy.filter((e) => e.id_producto === id_producto);
    setEans(newEans.sort((a, b) => a.codigo_ean.localeCompare(b.codigo_ean)));
    return newEans;
  };

  const setPresentacionesByEans = (eans: any[]) => {
    const presentacionesIDs = eans.map((e) => e.id_presentacion);
    const newPresentaciones = presentacionesLegacy.filter((p) =>
      presentacionesIDs.includes(p.id_presentacion)
    );
    setPresentaciones(
      newPresentaciones.sort((a, b) =>
        a.nombre_presentacion.localeCompare(b.nombre_presentacion)
      )
    );
  };

  const handleChange = (campo: keyof FormData, valor: string) => {
    setFormData((prev) => ({
      ...prev,
      [campo]: valor,
    }));

    if (campo === "familiaProducto") {
      setProductosByFamilia(valor);
      setFormData((prev) => ({
        ...prev,
        idProducto: "",
        presentacion: "",
        codigoEan: "",
      }));
    }

    if (campo === "idProducto") {
      const newEans = setEansByProductos(valor);
      setPresentacionesByEans(newEans);
      setFormData((prev) => ({
        ...prev,
        presentacion: "",
        codigoEan: "",
      }));
    }

    if (campo === "presentacion") {
      const newEan = eansLegacy.filter(
        (ean) =>
          ean.id_presentacion === valor &&
          ean.id_producto === formData.idProducto
      );
      setEans(newEan);
      setFormData((prev) => ({
        ...prev,
        codigoEan: newEan[0]?.codigo_ean ?? "",
      }));
    }
  };

  const resetForm = () => {
    setFormData(defaultFormData);
    setProductos(
      productosLegacy.sort((a, b) =>
        a.nombre_producto.localeCompare(b.nombre_producto)
      )
    );
    setPresentaciones(
      presentacionesLegacy.sort((a, b) =>
        a.nombre_presentacion.localeCompare(b.nombre_presentacion)
      )
    );
    setEans(
      eansLegacy.sort((a, b) => a.codigo_ean.localeCompare(b.codigo_ean))
    );
    setValidated(false);
  };

  const cargarAsociacion = async () => {
    try {
      setFormData((prev) => ({
        ...prev,
        familiaProducto: "",
        idProducto: "",
        presentacion: "",
        codigoEan: "",
        rutaEtiqueta: "",
      }));

      const asociaciones = await fetchAsociacionesProduccion();
      const encontrada = asociaciones.find(
        (a: any) =>
          a.id_llenadora === formData.idLlenadora &&
          a.id_cabezal_llenadora === formData.idCabezal
      );
      if (encontrada) {
        setIdAsociacionSeleccionada(encontrada.id);
        setFormData({
          idLlenadora: encontrada.id_llenadora || "",
          idCabezal: encontrada.id_cabezal_llenadora || "",
          idProducto: encontrada.id_producto || "",
          familiaProducto: encontrada.producto?.familia_producto || "",
          codigoEan: encontrada.codigo_ean || "",
          rutaEtiqueta: encontrada.ruta_etiqueta || "",
          presentacion: "",
        });

        if (!encontrada.codigo_ean) return;

        const eanTarget = eansLegacy.find(
          (ean: any) => ean.codigo_ean === encontrada.codigo_ean
        );
        const presentacionTarget = presentacionesLegacy.find(
          (p: any) => p.id_presentacion === eanTarget.id_presentacion
        );
        setFormData((prev) => ({
          ...prev,
          presentacion: presentacionTarget.id_presentacion,
        }));
      } else {
        setIdAsociacionSeleccionada(null);
      }
    } catch (error: any) {
      console.error(
        "Error al obtener la asociación de producción:",
        error.message
      );
      setIdAsociacionSeleccionada(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;

    if (!form.checkValidity()) {
      setValidated(true);
      return;
    }

    if (!idAsociacionSeleccionada) {
      activateToast({
        message: i18n.modalAsociacionProduccion.errorNoAsociacion,
        type: "danger",
      });
      return;
    }

    const eanSelected = eansLegacy.filter(
      (ean: any) => ean.codigo_ean === formData.codigoEan
    )[0];
    const presentacionSelected = presentacionesLegacy.filter(
      (pres: any) => pres.id_presentacion === formData.presentacion
    )[0];
    if (eanSelected.id_presentacion !== presentacionSelected.id_presentacion) {
      activateToast({
        message: i18n.modalAsociacionProduccion.errorEanPresentacion,
        type: "danger",
      });
      return;
    }

    const body: any = {
      id_producto: formData.idProducto,
      codigo_ean: formData.codigoEan,
    };

    if (formData.rutaEtiqueta) body.ruta_etiqueta = formData.rutaEtiqueta;

    try {
      await updateAsociacionProduccion(body, idAsociacionSeleccionada);
      activateToast({
        message: i18n.modalAsociacionProduccion.successAsociarProducto,
        type: "success",
      });

      resetForm();
      setIdAsociacionSeleccionada(null);
    } catch (error: any) {
      activateToast({
        message:
          error.message || i18n.modalAsociacionProduccion.errorAsociarProducto,
        type: "danger",
      });
    }
  };

  const handleClose = () => {
    const modal = document.getElementById("ModalAsociacionProduccion");
    // @ts-ignore
    const modalInstance = window.bootstrap.Modal.getOrCreateInstance(modal);
    modalInstance.hide();
    setTimeout(() => {
      resetForm();
    }, 500);
  };

  const fetchInitialData = async () => {
    try {
      const asociacionesRaw = await fetchAsociacionesProduccion();
      const idsVistos = new Set();

      const llenadorasMap = asociacionesRaw
        .filter((a: any) => {
          if (idsVistos.has(a.llenadora.id_llenadora)) return false;
          idsVistos.add(a.llenadora.id_llenadora);
          return true;
        })
        .map((a: any) => ({
          id: a.llenadora.id,
          id_llenadora: a.llenadora.id_llenadora,
          nombre_llenadora: a.llenadora.nombre_llenadora,
        }));
      setLlenadoras(llenadorasMap);

      setFamilias(await fetchFamilias({}));

      const productos = await fetchProductos({}, {});
      setProductosLegacy(productos);
      setProductos(
        productos.sort((a: any, b: any) =>
          a.nombre_producto.localeCompare(b.nombre_producto)
        )
      );

      const presentaciones = await fetchPresentaciones({});
      setPresentacionesLegacy(presentaciones);
      setPresentaciones(
        presentaciones.sort((a: any, b: any) =>
          a.nombre_presentacion.localeCompare(b.nombre_presentacion)
        )
      );

      const eans = await fetchEans({}, {});
      setEansLegacy(eans);
      setEans(
        eans.sort((a: any, b: any) => a.codigo_ean.localeCompare(b.codigo_ean))
      );
    } catch (error: any) {
      console.error("Error al cargar datos:", error.message);
    }
  };

  const getCabezales = async (id_llenadora: string) => {
    try {
      setCabezales(
        await fetchCabezales({
          id_llenadora,
        })
      );
    } catch (error: any) {
      console.error("Error al cargar datos:", error.message);
    }
  };

  useEffect(() => {
    if (!formData.idLlenadora) return;
    getCabezales(formData.idLlenadora);

    if (formData.idCabezal) cargarAsociacion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.idLlenadora]);

  useEffect(() => {
    if (!formData.idCabezal || !formData.idLlenadora) return;

    if (formData.idLlenadora) {
      cargarAsociacion();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.idCabezal]);

  useEffect(() => {
    const modal = document.getElementById("ModalAsociacionProduccion");

    const handleShown = () => {
      fetchInitialData();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        const modal = document.getElementById("ModalAsociacionProduccion");
        const isVisible = modal?.classList.contains("show");

        if (isVisible) {
          e.preventDefault();
          ModalAsociacionProduccionBtnRef.current?.click();
        }
      }
    };

    modal?.addEventListener("shown.bs.modal", handleShown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      modal?.removeEventListener("shown.bs.modal", handleShown);
      document.removeEventListener("keydown", handleKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="modal fade modal-unificado"
      id="ModalAsociacionProduccion"
      tabIndex={-1}
      aria-hidden="true"
    >
      <div className="modal-dialog modal-dialog-centered modal-md">
        <div className="modal-content">
          {/* Header */}
          <div className="modal-header">
            <h5 className="modal-title">
              {i18n.modalAsociacionProduccion.title}
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={handleClose}
            ></button>
          </div>

          {/* Body con scroll */}
          <div className="modal-body">
            <form
              id="formAsociacionProduccion"
              className={`filtros-form-columna ${
                validated ? "was-validated" : ""
              }`}
              noValidate
              onSubmit={handleSubmit}
            >
              {/* Llenadora */}
              <div className="C-CM1-form-group">
                <label className="form-label">
                  {i18n.modalAsociacionProduccion.llenadoraLabel}
                </label>
                <select
                  className="form-select form-select-sm"
                  required
                  value={formData.idLlenadora}
                  onChange={(e) => handleChange("idLlenadora", e.target.value)}
                >
                  <option value="" disabled hidden>
                    {i18n.modalAsociacionProduccion.selectLlenadora}
                  </option>
                  {llenadoras.map((llenadora: any) => (
                    <option key={llenadora.id} value={llenadora.id_llenadora}>
                      {llenadora.nombre_llenadora}
                    </option>
                  ))}
                </select>
                <div className="invalid-feedback">
                  {i18n.modalAsociacionProduccion.llenadoraInvalid}
                </div>
              </div>

              {/* Cabezal */}
              <div className="C-CM1-form-group">
                <label className="form-label">
                  {i18n.modalAsociacionProduccion.cabezalLabel}
                </label>
                <select
                  className="form-select form-select-sm"
                  required
                  value={formData.idCabezal}
                  onChange={(e) => handleChange("idCabezal", e.target.value)}
                >
                  <option value="" disabled hidden>
                    {i18n.modalAsociacionProduccion.selectCabezal}
                  </option>
                  {cabezales.map((cabezal: any) => (
                    <option key={cabezal.id} value={cabezal.id_cabezal}>
                      {cabezal.nombre_cabezal}
                    </option>
                  ))}
                </select>
                <div className="invalid-feedback">
                  {i18n.modalAsociacionProduccion.cabezalInvalid}
                </div>
              </div>

              {/* Familia de producto */}
              <div className="C-CM1-form-group">
                <label className="form-label">
                  {i18n.modalAsociacionProduccion.familiaLabel}
                </label>
                <select
                  className="form-select form-select-sm"
                  required
                  value={formData.familiaProducto}
                  onChange={(e) =>
                    handleChange("familiaProducto", e.target.value)
                  }
                >
                  <option value="" disabled hidden>
                    {i18n.modalAsociacionProduccion.selectFamilia}
                  </option>
                  {familias.map((familia, idx) => (
                    <option key={familia + idx} value={familia}>
                      {familia}
                    </option>
                  ))}
                </select>
                <div className="invalid-feedback">
                  {i18n.modalAsociacionProduccion.familiaInvalid}
                </div>
              </div>

              {/* Producto */}
              <div className="C-CM1-form-group">
                <label className="form-label">
                  {i18n.modalAsociacionProduccion.productoLabel}
                </label>
                <select
                  className="form-select form-select-sm"
                  required
                  value={formData.idProducto}
                  onChange={(e) => handleChange("idProducto", e.target.value)}
                >
                  <option value="" disabled hidden>
                    {i18n.modalAsociacionProduccion.selectProducto}
                  </option>
                  {productos.map((producto: any) => (
                    <option key={producto.id} value={producto.id_producto}>
                      {producto.nombre_producto}
                    </option>
                  ))}
                </select>
                <div className="invalid-feedback">
                  {i18n.modalAsociacionProduccion.productoInvalid}
                </div>
              </div>

              {/* Presentación */}
              <div className="C-CM1-form-group">
                <label className="form-label">
                  {i18n.modalAsociacionProduccion.presentacionLabel}
                </label>
                <select
                  className="form-select form-select-sm"
                  required
                  value={formData.presentacion}
                  onChange={(e) => handleChange("presentacion", e.target.value)}
                >
                  <option value="" disabled hidden>
                    {i18n.modalAsociacionProduccion.selectPresentacion}
                  </option>
                  {presentaciones.map((presentacion: any) => (
                    <option
                      key={presentacion.id}
                      value={presentacion.id_presentacion}
                    >
                      {presentacion.nombre_presentacion}
                    </option>
                  ))}
                </select>
                <div className="invalid-feedback">
                  {i18n.modalAsociacionProduccion.presentacionInvalid}
                </div>
              </div>

              {/* Código EAN */}
              <div className="C-CM1-form-group">
                <label className="form-label">
                  {i18n.modalAsociacionProduccion.codigoEanLabel}
                </label>
                <select
                  className="form-select form-select-sm"
                  required
                  value={formData.codigoEan}
                  onChange={(e) => handleChange("codigoEan", e.target.value)}
                >
                  <option value="" disabled hidden>
                    {i18n.modalAsociacionProduccion.selectCodigoEan}
                  </option>
                  {eans.map((ean: any) => (
                    <option key={ean.id} value={ean.codigo_ean}>
                      {ean.codigo_ean}
                    </option>
                  ))}
                </select>
                <div className="invalid-feedback">
                  {i18n.modalAsociacionProduccion.codigoEanInvalid}
                </div>
              </div>

              {/* Ruta de etiqueta */}
              {isUserAdmin && (
                <>
                  <div className="C-CM1-form-group">
                    <label className="form-label">
                      {i18n.modalAsociacionProduccion.rutaEtiquetaLabel}
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      maxLength={500}
                      value={formData.rutaEtiqueta}
                      onChange={(e) =>
                        handleChange("rutaEtiqueta", e.target.value)
                      }
                    />
                    <div className="invalid-feedback">
                      {i18n.modalAsociacionProduccion.rutaEtiquetaInvalid}
                    </div>
                  </div>
                </>
              )}
            </form>
          </div>

          {/* Footer fijo */}
          <div className="modal-footer d-flex justify-content-between gap-3">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={resetForm}
            >
              {i18n.modalAsociacionProduccion.borrarCamposBtn}
            </button>
            <button
              type="submit"
              className="btn btn-warning"
              form="formAsociacionProduccion"
              ref={ModalAsociacionProduccionBtnRef}
            >
              {i18n.modalAsociacionProduccion.asociarBtn}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalAsociacionProduccion;

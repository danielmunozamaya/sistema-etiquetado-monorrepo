import { useState, useEffect } from "react";
import "../../modales.css";
import "./ModalEtiquetadoManual.css";
import {
  fetchAsociacionesProduccion,
  fetchCabezales,
  fetchNumeroBidon,
  fetchFamilias,
  fetchProductos,
  fetchPresentaciones,
  fetchEans,
  postEtiquetaManual,
} from "./services/ModalEtiquetadoManual";
import { activateToast } from "../ToastMessage/helpers/ToastMessage.helpers";
import { i18n } from "../../i18n";

const today = new Date();
const todayStr = today.toISOString().split("T")[0]; // YYYY-MM-DD

const oneYearLater = new Date(today);
oneYearLater.setDate(oneYearLater.getDate() + 365);
const oneYearStr = oneYearLater.toISOString().split("T")[0]; // YYYY-MM-DD

const defaultFormData = {
  idLlenadora: "",
  idCabezal: "",
  numeroBidon: 1,
  familiaProducto: "",
  idProducto: "",
  idPresentacion: "",
  pesoNeto: "",
  pesoBruto: "",
  codigoEan: "",
  fechaProduccion: todayStr,
  horaProduccion: "",
  intervaloMinutos: 0,
  fechaCaducidad: oneYearStr,
  noLote: "",
  noMatricula: "",
  sscc: "",
  code: "",
  titulo1: "",
  valor1: "",
  titulo2: "",
  valor2: "",
  numeroEtiquetas: 1,
};

const ModalEtiquetadoManual = () => {
  const [formData, setFormData] = useState(defaultFormData);
  const [llenadoras, setLlenadoras] = useState([]);
  const [cabezales, setCabezales] = useState([]);
  const [familias, setFamilias] = useState([]);
  const [productosLegacy, setProductosLegacy] = useState([]);
  const [productos, setProductos] = useState([]);
  const [presentacionesLegacy, setPresentacionesLegacy] = useState([]);
  const [presentaciones, setPresentaciones] = useState([]);
  const [eansLegacy, setEansLegacy] = useState([]);
  const [eans, setEans] = useState([]);

  const [validated, setValidated] = useState(false);
  const [errors, setErrors] = useState({});

  const setProductosByFamilia = (familia) => {
    const newProductos = productosLegacy.filter(
      (p) => p.familia_producto === familia
    );
    setProductos(
      newProductos.sort((a, b) =>
        a.nombre_producto.localeCompare(b.nombre_producto)
      )
    );
  };

  const setEansByProductos = (id_producto) => {
    const newEans = eansLegacy.filter((e) => e.id_producto === id_producto);
    setEans(newEans.sort((a, b) => a.codigo_ean.localeCompare(b.codigo_ean)));
    return newEans;
  };

  const setPresentacionesByEans = (eans) => {
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

  const handleChange = (campo, valor) => {
    setFormData((prev) => ({
      ...prev,
      [campo]: valor,
    }));

    if (campo === "familiaProducto") {
      setProductosByFamilia(valor);
      setFormData((prev) => ({
        ...prev,
        idProducto: "",
        idPresentacion: "",
        codigoEan: "",
      }));
    }

    if (campo === "idProducto") {
      const newEans = setEansByProductos(valor);
      setPresentacionesByEans(newEans);
      setFormData((prev) => ({
        ...prev,
        idPresentacion: "",
        codigoEan: "",
      }));
    }

    if (campo === "idPresentacion") {
      const newEan = eansLegacy.filter(
        (ean) =>
          ean.id_presentacion === valor &&
          ean.id_producto === formData.idProducto
      );
      setFormData((prev) => ({
        ...prev,
        codigoEan: newEan[0]?.codigo_ean ?? "",
      }));
    }
  };

  const validateForm = (formData) => {
    const errors = {};

    if (!formData.idLlenadora || formData.idLlenadora === "") {
      errors.idLlenadora = i18n.modalEtiquetadoManual.idLlenadoraInvalid;
    }

    if (!formData.idCabezal || formData.idCabezal === "") {
      errors.idCabezal = i18n.modalEtiquetadoManual.idCabezalInvalid;
    }

    if (!formData.numeroBidon || isNaN(Number(formData.numeroBidon))) {
      errors.numeroBidon = i18n.modalEtiquetadoManual.numeroBidonInvalid;
    } else {
      const valor = parseInt(formData.numeroBidon, 10);
      if (valor < 1) {
        errors.numeroBidon = i18n.modalEtiquetadoManual.numeroBidonInvalid;
      } else if (valor > 9999999999) {
        errors.numeroBidon = i18n.modalEtiquetadoManual.numeroBidonMaxInvalid;
      }
    }

    if (!formData.familiaProducto || formData.familiaProducto === "") {
      errors.familiaProducto =
        i18n.modalEtiquetadoManual.familiaProductoInvalid;
    }

    if (!formData.idProducto || formData.idProducto === "") {
      errors.idProducto = i18n.modalEtiquetadoManual.idProductoInvalid;
    }

    if (!formData.idPresentacion || formData.idPresentacion === "") {
      errors.idPresentacion = i18n.modalEtiquetadoManual.idPresentacionInvalid;
    }

    if (!formData.pesoNeto || isNaN(Number(formData.pesoNeto))) {
      errors.pesoNeto = i18n.modalEtiquetadoManual.pesoNetoInvalid;
    } else {
      const valor = parseFloat(formData.pesoNeto);
      const tieneDosDecimales = /^\d+(\.\d{1,2})?$/.test(formData.pesoNeto);

      if (valor < 0 || valor > 9999999.99) {
        errors.pesoNeto = i18n.modalEtiquetadoManual.pesoNetoInvalid;
      } else if (!tieneDosDecimales) {
        errors.pesoNeto = i18n.modalEtiquetadoManual.pesoNetoDecimalesInvalid;
      }
    }

    if (!formData.pesoBruto || isNaN(Number(formData.pesoBruto))) {
      errors.pesoBruto = i18n.modalEtiquetadoManual.pesoBrutoInvalid;
    } else {
      const valor = parseFloat(formData.pesoBruto);
      const tieneDosDecimales = /^\d+(\.\d{1,2})?$/.test(formData.pesoBruto);

      if (valor < 0 || valor > 9999999.99) {
        errors.pesoBruto = i18n.modalEtiquetadoManual.pesoBrutoInvalid;
      } else if (!tieneDosDecimales) {
        errors.pesoBruto = i18n.modalEtiquetadoManual.pesoBrutoDecimalesInvalid;
      }
    }

    if (!formData.codigoEan || formData.codigoEan === "") {
      errors.codigoEan = i18n.modalEtiquetadoManual.codigoEanInvalid;
    }

    if (!formData.fechaProduccion) {
      errors.fechaProduccion =
        i18n.modalEtiquetadoManual.fechaProduccionInvalid;
    } else {
      const fecha = new Date(formData.fechaProduccion);
      if (isNaN(fecha.getTime())) {
        errors.fechaProduccion =
          i18n.modalEtiquetadoManual.fechaProduccionFormatoInvalid;
      }
    }

    if (!formData.horaProduccion) {
      errors.horaProduccion = i18n.modalEtiquetadoManual.horaProduccionInvalid;
    } else {
      const regexHora = /^([01]\d|2[0-3]):([0-5]\d)$/;
      if (!regexHora.test(formData.horaProduccion)) {
        errors.horaProduccion =
          i18n.modalEtiquetadoManual.horaProduccionFormatoInvalid;
      }
    }

    if (
      formData.intervaloMinutos === "" ||
      isNaN(Number(formData.intervaloMinutos))
    ) {
      errors.intervaloMinutos =
        i18n.modalEtiquetadoManual.intervaloMinutosInvalid;
    } else {
      const valor = parseInt(formData.intervaloMinutos, 10);
      if (!Number.isInteger(valor)) {
        errors.intervaloMinutos =
          i18n.modalEtiquetadoManual.intervaloMinutosFormatoInvalid;
      } else if (valor < 0 || valor > 60) {
        errors.intervaloMinutos =
          i18n.modalEtiquetadoManual.intervaloMinutosRangoInvalid;
      }
    }

    if (!formData.fechaCaducidad) {
      errors.fechaCaducidad = i18n.modalEtiquetadoManual.fechaCaducidadInvalid;
    } else {
      const fecha = new Date(formData.fechaCaducidad);
      if (isNaN(fecha.getTime())) {
        errors.fechaCaducidad =
          i18n.modalEtiquetadoManual.fechaCaducidadFormatoInvalid;
      }
    }

    if (!formData.noMatricula) {
      errors.noMatricula = i18n.modalEtiquetadoManual.noMatriculaInvalid;
    } else {
      const regexMatricula = /^\d{18}$/;
      if (!regexMatricula.test(formData.noMatricula)) {
        errors.noMatricula =
          i18n.modalEtiquetadoManual.noMatriculaFormatoInvalid;
      }
    }

    if (!formData.noLote) {
      errors.noLote = i18n.modalEtiquetadoManual.noLoteInvalid;
    } else {
      const regexLote = /^\d{9}$/;
      if (!regexLote.test(formData.noLote)) {
        errors.noLote = i18n.modalEtiquetadoManual.noLoteFormatoInvalid;
      }
    }

    if (formData.sscc && formData.sscc.length > 30) {
      errors.sscc = i18n.modalEtiquetadoManual.ssccInvalid;
    }

    if (!formData.code) {
      errors.code = i18n.modalEtiquetadoManual.codeInvalid;
    } else {
      const regexCode = /^\d{3}$/;
      if (!regexCode.test(formData.code)) {
        errors.code = i18n.modalEtiquetadoManual.codeFormatoInvalid;
      }
    }

    if (formData.titulo1 && formData.titulo1.length > 99) {
      errors.titulo1 = i18n.modalEtiquetadoManual.titulo1Invalid;
    }
    if (formData.valor1 && formData.valor1.length > 199) {
      errors.valor1 = i18n.modalEtiquetadoManual.valor1Invalid;
    }
    if (
      (formData.titulo1.length && !formData.valor1.length) ||
      (!formData.titulo1.length && formData.valor1.length)
    ) {
      errors.titulo1 =
        i18n.modalEtiquetadoManual.titulo1Valor1DependenciaInvalid;
      errors.valor1 =
        i18n.modalEtiquetadoManual.titulo1Valor1DependenciaInvalid;
    }
    if (formData.titulo2 && formData.titulo2.length > 99) {
      errors.titulo2 = i18n.modalEtiquetadoManual.titulo2Invalid;
    }
    if (formData.valor2 && formData.valor2.length > 199) {
      errors.valor2 = i18n.modalEtiquetadoManual.valor2Invalid;
    }
    if (
      (formData.titulo2.length && !formData.valor2.length) ||
      (!formData.titulo2.length && formData.valor2.length)
    ) {
      errors.titulo2 =
        i18n.modalEtiquetadoManual.titulo2Valor2DependenciaInvalid;
      errors.valor2 =
        i18n.modalEtiquetadoManual.titulo2Valor2DependenciaInvalid;
    }

    if (!formData.numeroEtiquetas) {
      errors.numeroEtiquetas =
        i18n.modalEtiquetadoManual.numeroEtiquetasInvalid;
    } else {
      const numero = Number(formData.numeroEtiquetas);
      const esEntero = Number.isInteger(numero);
      if (!esEntero) {
        errors.numeroEtiquetas =
          i18n.modalEtiquetadoManual.numeroEtiquetasFormatoInvalid;
      } else if (numero < 1 || numero > 20) {
        errors.numeroEtiquetas =
          i18n.modalEtiquetadoManual.numeroEtiquetasRangoInvalid;
      }
    }

    return Object.keys(errors).length === 0 ? null : errors;
  };

  const resetForm = () => {
    setFormData(defaultFormData);

    const nuevoCode = calculateCode(formData.fechaProduccion);
    setFormData((prev) => ({
      ...prev,
      code: nuevoCode,
    }));

    setValidated(false);
    setErrors(false);
    setCabezales([]);
  };

  const setPostBody = () => {
    let body = {
      code: Number(formData.code),
      codigo_ean: formData.codigoEan,
      familia_producto: formData.familiaProducto,
      fecha_caducidad: formData.fechaCaducidad,
      fecha_produccion: formData.fechaProduccion,
      hora_produccion: formData.horaProduccion,
      id_cabezal_llenadora: formData.idCabezal,
      id_llenadora: formData.idLlenadora,
      id_producto: formData.idProducto,
      intervalo_minutos: Number(formData.intervaloMinutos),
      no_lote: formData.noLote,
      no_matricula: formData.noMatricula,
      no_bidon: Number(formData.numeroBidon),
      numero_etiquetas: Number(formData.numeroEtiquetas),
      peso_bruto: parseFloat(formData.pesoBruto),
      peso_neto: parseFloat(formData.pesoNeto),
    };

    if (formData.sscc && formData.sscc.length) body.sscc = formData.sscc;
    if (formData.titulo1 && formData.titulo1.length)
      body.titulo_1 = formData.titulo1;
    if (formData.valor1 && formData.valor1.length)
      body.valor_1 = formData.valor1;
    if (formData.titulo2 && formData.titulo2.length)
      body.titulo_2 = formData.titulo2;
    if (formData.valor2 && formData.valor2.length)
      body.valor_2 = formData.valor2;

    return body;
  };

  const handleSubmit = async () => {
    const validationErrors = validateForm(formData);

    if (validationErrors) {
      setErrors(validationErrors);
      setValidated(true);
      return;
    }

    setErrors({});
    setValidated(false);

    const serviceBody = setPostBody();
    try {
      await postEtiquetaManual(serviceBody);
      activateToast({
        message: i18n.modalEtiquetadoManual.successImprimirEtiquetas,
        type: "success",
      });
      cargarNumeroBidon();
    } catch (error) {
      activateToast({
        message:
          error.message || i18n.modalEtiquetadoManual.errorImprimirEtiquetas,
        type: "danger",
      });
    }
  };

  const handleClose = () => {
    const modal = document.getElementById("ModalEtiquetadoManual");
    const modalInstance = bootstrap.Modal.getOrCreateInstance(modal);
    modalInstance.hide();
    setTimeout(() => {
      resetForm();
    }, 500);
  };

  const fetchInitialData = async () => {
    try {
      const asociacionesRaw = await fetchAsociacionesProduccion({});
      const idsVistos = new Set();

      const llenadorasMap = asociacionesRaw
        .filter((a) => {
          if (idsVistos.has(a.llenadora.id_llenadora)) return false;
          idsVistos.add(a.llenadora.id_llenadora);
          return true;
        })
        .map((a) => ({
          id: a.llenadora.id,
          id_llenadora: a.llenadora.id_llenadora,
          nombre_llenadora: a.llenadora.nombre_llenadora,
        }));
      setLlenadoras(llenadorasMap);

      setFamilias(await fetchFamilias({}));

      const productos = await fetchProductos({});
      setProductosLegacy(productos);
      setProductos(
        productos.sort((a, b) =>
          a.nombre_producto.localeCompare(b.nombre_producto)
        )
      );

      const presentaciones = await fetchPresentaciones({}, {});
      setPresentacionesLegacy(presentaciones);
      setPresentaciones(
        presentaciones.sort((a, b) =>
          a.nombre_presentacion.localeCompare(b.nombre_presentacion)
        )
      );

      const eans = await fetchEans({}, {});
      setEansLegacy(eans);
      setEans(eans.sort((a, b) => a.codigo_ean.localeCompare(b.codigo_ean)));
    } catch (error) {
      console.error("Error al cargar datos:", error.message);
    }
  };

  const cargarAsociacion = async () => {
    try {
      setFormData((prev) => ({
        ...prev,
        familiaProducto: "",
        idProducto: "",
        idPresentacion: "",
        codigoEan: "",
      }));

      const asociaciones = await fetchAsociacionesProduccion();
      const encontrada = asociaciones.find(
        (a) =>
          a.id_llenadora === formData.idLlenadora &&
          a.id_cabezal_llenadora === formData.idCabezal
      );
      if (!encontrada) return;

      setFormData((prev) => ({
        ...prev,
        familiaProducto: encontrada.producto?.familia_producto || "",
        idProducto: encontrada.id_producto || "",
        codigoEan: encontrada.codigo_ean || "",
      }));

      if (!encontrada.codigo_ean) return;

      const eanTarget = eansLegacy.find(
        (ean) => ean.codigo_ean === encontrada.codigo_ean
      );
      setEans([eanTarget]);
      const presentacionTarget = presentacionesLegacy.find(
        (p) => p.id_presentacion === eanTarget.id_presentacion
      );
      setPresentaciones([presentacionTarget]);
      setFormData((prev) => ({
        ...prev,
        idPresentacion: presentacionTarget.id_presentacion,
      }));
    } catch (error) {
      console.error(
        "Error al obtener la asociación de producción:",
        error.message
      );
    }
  };

  const cargarNumeroBidon = async () => {
    const numeroBidonQueryResponse = await fetchNumeroBidon(
      {
        where: {
          anio: { eq: new Date().getFullYear() },
          id_llenadora: { eq: formData.idLlenadora },
          id_cabezal_llenadora: { eq: formData.idCabezal },
        },
        select: ["id_llenadora", "id_cabezal_llenadora", "numero_bidon"],
      },
      {}
    );

    if (numeroBidonQueryResponse.length) {
      setFormData((prev) => ({
        ...prev,
        numeroBidon: numeroBidonQueryResponse?.[0]?.numero_bidon ?? 1,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        numeroBidon: 1,
      }));
    }
  };

  useEffect(() => {
    if (!formData.idLlenadora) return;

    const getCabezales = async (id_llenadora) => {
      try {
        setCabezales(
          await fetchCabezales({
            id_llenadora,
          })
        );
      } catch (error) {
        console.error("Error al cargar datos:", error.message);
      }
    };

    getCabezales(formData.idLlenadora);

    if (formData.idCabezal) {
      cargarAsociacion();
      cargarNumeroBidon();
    }
  }, [formData.idLlenadora]);

  useEffect(() => {
    if (!formData.idCabezal || !formData.idLlenadora) return;

    if (formData.idLlenadora) {
      cargarAsociacion();
      cargarNumeroBidon();
    }
  }, [formData.idCabezal]);

  useEffect(() => {
    if (!formData.idPresentacion) {
      setFormData((prev) => ({
        ...prev,
        pesoNeto: "",
        pesoBruto: "",
      }));
      return;
    }

    const presentacionSeleccionada = presentaciones.find(
      (p) => p.id_presentacion === formData.idPresentacion
    );

    setFormData((prev) => ({
      ...prev,
      pesoNeto: presentacionSeleccionada?.peso_neto || "",
      pesoBruto: presentacionSeleccionada?.peso_bruto || "",
    }));
  }, [formData.idPresentacion]);

  const calculateCode = (fechaProduccion) => {
    const date = new Date(fechaProduccion);
    const es29Febrero = date.getDate() === 29 && date.getMonth() === 1;
    if (es29Febrero) return 366;

    return parseInt(
      Math.floor(
        (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) /
          86400000
      ).toString()
    );
  };

  useEffect(() => {
    if (!formData.fechaProduccion) return;

    const nuevoCode = calculateCode(formData.fechaProduccion);

    setFormData((prev) => ({
      ...prev,
      code: nuevoCode,
    }));
  }, [formData.fechaProduccion]);

  useEffect(() => {
    if (!formData.idLlenadora || !formData.code || !formData.horaProduccion)
      return;

    const generaNoLote = (idLlenadora, code, hora) => {
      const anio = new Date().getFullYear().toString().slice(-2);
      const codeStr = code.toString().padStart(3, "0");
      const horaStr = hora.split(":")[0];
      const llenadoraNum = idLlenadora.padStart(2, "0");
      return `${anio}${codeStr}${horaStr}${llenadoraNum}`;
    };

    const noLote = generaNoLote(
      formData.idLlenadora,
      formData.code,
      formData.horaProduccion
    );

    setFormData((prev) => ({
      ...prev,
      noLote,
    }));
  }, [formData.idLlenadora, formData.code, formData.horaProduccion]);

  useEffect(() => {
    const { numeroBidon, idCabezal, idLlenadora, code, horaProduccion, codigoEan } =
      formData;

    if (!numeroBidon || !idCabezal || !idLlenadora || !code || !horaProduccion || !codigoEan)
      return;

    const esEntero = (v) => Number.isInteger(Number(v));
    const esCodigoValido = (v) => /^[0-9]{3}$/.test(v);
    const esHoraValida = (v) => /^([01]\d|2[0-3]):[0-5]\d$/.test(v);
    const esLlenadoraValida = (v) => /^[0-9]{2}$/.test(v);
    const esCabezalValido = (v) => ["A", "B", "C"].includes(v);

    if (
      !esEntero(numeroBidon) ||
      !esCodigoValido(code) ||
      !esHoraValida(horaProduccion) ||
      !esLlenadoraValida(idLlenadora) ||
      !esCabezalValido(idCabezal)
    ) {
      return;
    }

    const generarNoMatricula = (
      numeroBidon,
      idCabezal,
      idLlenadora,
      code,
      hora,
      codigoEan,
    ) => {
      const cabezalNum = idCabezal.toUpperCase().charCodeAt(0) - 64;
      const tipoEtiquetaStr = 3;
      const año = new Date().getFullYear().toString().slice(-2);
      const codeStr = code.toString().padStart(3, "0");
      const horaStr = hora.split(":")[0];
      const llenadoraNum = idLlenadora.padStart(2, "0");
      const bidonStr = numeroBidon.toString().slice(0, 6).padStart(6, "0");

      const codigoEanStr = (codigoEan ?? '').toString();
      const eanDigits = codigoEanStr.substring(9, 12).padEnd(3, '0');

      const raiz = `${cabezalNum}${eanDigits}${codeStr}${horaStr}${llenadoraNum}${bidonStr}`;
      const suma = raiz
        .split("")
        .reduce(
          (acc, val, idx) => acc + Number(val) * (idx % 2 === 0 ? 3 : 1),
          0
        );
      const siguienteMultiplo10 = Math.ceil(suma / 10) * 10;
      const digito_control = siguienteMultiplo10 - suma;
      const no_matricula = raiz + `${digito_control}`;

      return no_matricula;
    };

    const nuevaMatricula = generarNoMatricula(
      numeroBidon,
      idCabezal,
      idLlenadora,
      code,
      horaProduccion,
      codigoEan
    );

    setFormData((prev) => ({
      ...prev,
      noMatricula: nuevaMatricula,
    }));
  }, [
    formData.numeroBidon,
    formData.idCabezal,
    formData.idLlenadora,
    formData.code,
    formData.horaProduccion,
    formData.codigoEan,
  ]);

  useEffect(() => {
    const modal = document.getElementById("ModalEtiquetadoManual");

    const handleShown = () => {
      fetchInitialData();
    };

    modal.addEventListener("shown.bs.modal", handleShown);
    return () => {
      modal.removeEventListener("shown.bs.modal", handleShown);
    };
  }, []);

  return (
    <div
      className="modal fade modal-unificado"
      id="ModalEtiquetadoManual"
      tabIndex="-1"
      aria-hidden="true"
    >
      <div className="modal-dialog modal-dialog-centered modal-md">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{i18n.modalEtiquetadoManual.title}</h5>
            <button
              type="button"
              className="btn-close"
              onClick={handleClose}
            ></button>
          </div>

          <div className="modal-body">
            <form
              id="formEtiquetadoManual"
              className="filtros-form-columna"
              noValidate
            >
              <div className="C-CM1-form-group">
                <label className="form-label">
                  {i18n.modalEtiquetadoManual.llenadoraLabel}
                </label>
                <select
                  className={`form-select ${
                    validated
                      ? errors.idLlenadora
                        ? "is-invalid"
                        : "is-valid"
                      : ""
                  }`}
                  value={formData.idLlenadora}
                  onChange={(e) => handleChange("idLlenadora", e.target.value)}
                >
                  <option value="" disabled hidden>
                    {i18n.modalEtiquetadoManual.selectLlenadora}
                  </option>
                  {llenadoras.map((l) => (
                    <option key={l.id} value={l.id_llenadora}>
                      {l.nombre_llenadora}
                    </option>
                  ))}
                </select>
                <div className="invalid-feedback">{errors.idLlenadora}</div>
              </div>

              <div className="C-CM1-form-group">
                <label className="form-label">
                  {i18n.modalEtiquetadoManual.cabezalLabel}
                </label>
                <select
                  className={`form-select ${
                    validated
                      ? errors.idCabezal
                        ? "is-invalid"
                        : "is-valid"
                      : ""
                  }`}
                  value={formData.idCabezal}
                  onChange={(e) => handleChange("idCabezal", e.target.value)}
                >
                  <option value="" disabled hidden>
                    {i18n.modalEtiquetadoManual.selectCabezal}
                  </option>
                  {cabezales.map((l) => (
                    <option key={l.id} value={l.id_cabezal}>
                      {l.nombre_cabezal}
                    </option>
                  ))}
                </select>
                <div className="invalid-feedback">{errors.idCabezal}</div>
              </div>

              <div className="C-CM1-form-group">
                <label className="form-label">
                  {i18n.modalEtiquetadoManual.numeroBidonLabel}
                </label>
                <input
                  type="number"
                  min={1}
                  max={999999999999999}
                  disabled
                  className={`form-control ${
                    validated
                      ? errors.numeroBidon
                        ? "is-invalid"
                        : "is-valid"
                      : ""
                  }`}
                  value={formData.numeroBidon || ""}
                  onChange={(e) => handleChange("numeroBidon", e.target.value)}
                />
                <div className="invalid-feedback">{errors.numeroBidon}</div>
              </div>

              <div className="C-CM1-form-group">
                <label className="form-label">
                  {i18n.modalEtiquetadoManual.familiaProductoLabel}
                </label>
                <select
                  className={`form-select ${
                    validated
                      ? errors.familiaProducto
                        ? "is-invalid"
                        : "is-valid"
                      : ""
                  }`}
                  value={formData.familiaProducto}
                  onChange={(e) =>
                    handleChange("familiaProducto", e.target.value)
                  }
                >
                  <option value="" disabled hidden>
                    {i18n.modalEtiquetadoManual.selectFamiliaProducto}
                  </option>
                  {familias.map((familia, idx) => (
                    <option key={familia + idx} value={familia}>
                      {familia}
                    </option>
                  ))}
                </select>
                <div className="invalid-feedback">{errors.familiaProducto}</div>
              </div>

              <div className="C-CM1-form-group">
                <label className="form-label">
                  {i18n.modalEtiquetadoManual.productoLabel}
                </label>
                <select
                  className={`form-select ${
                    validated
                      ? errors.idProducto
                        ? "is-invalid"
                        : "is-valid"
                      : ""
                  }`}
                  value={formData.idProducto}
                  onChange={(e) => handleChange("idProducto", e.target.value)}
                >
                  <option value="" disabled hidden>
                    {i18n.modalEtiquetadoManual.selectProducto}
                  </option>
                  {productos.map((producto) => (
                    <option key={producto.id} value={producto.id_producto}>
                      {producto.nombre_producto}
                    </option>
                  ))}
                </select>
                <div className="invalid-feedback">{errors.idProducto}</div>
              </div>

              <div className="C-CM1-form-group">
                <label className="form-label">
                  {i18n.modalEtiquetadoManual.presentacionLabel}
                </label>
                <select
                  className={`form-select ${
                    validated
                      ? errors.idPresentacion
                        ? "is-invalid"
                        : "is-valid"
                      : ""
                  }`}
                  value={formData.idPresentacion}
                  onChange={(e) =>
                    handleChange("idPresentacion", e.target.value)
                  }
                >
                  <option value="" disabled hidden>
                    {i18n.modalEtiquetadoManual.selectPresentacion}
                  </option>
                  {presentaciones.map((p) => (
                    <option key={p.id} value={p.id_presentacion}>
                      {p.nombre_presentacion}
                    </option>
                  ))}
                </select>
                <div className="invalid-feedback">{errors.idPresentacion}</div>
              </div>

              <div className="C-CM1-form-group">
                <label className="form-label">
                  {i18n.modalEtiquetadoManual.pesoNetoLabel}
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="9999999.99"
                  disabled
                  className={`form-control ${
                    validated
                      ? errors.pesoNeto
                        ? "is-invalid"
                        : "is-valid"
                      : ""
                  }`}
                  value={formData.pesoNeto || ""}
                  onChange={(e) => handleChange("pesoNeto", e.target.value)}
                  placeholder="0 - 9999999.99"
                />
                <div className="invalid-feedback">{errors.pesoNeto}</div>
              </div>

              <div className="C-CM1-form-group">
                <label className="form-label">
                  {i18n.modalEtiquetadoManual.pesoBrutoLabel}
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="9999999.99"
                  disabled
                  className={`form-control ${
                    validated
                      ? errors.pesoBruto
                        ? "is-invalid"
                        : "is-valid"
                      : ""
                  }`}
                  value={formData.pesoBruto || ""}
                  onChange={(e) => handleChange("pesoBruto", e.target.value)}
                  placeholder="0 - 9999999.99"
                />
                <div className="invalid-feedback">{errors.pesoBruto}</div>
              </div>

              <div className="C-CM1-form-group">
                <label className="form-label">
                  {i18n.modalEtiquetadoManual.codigoEanLabel}
                </label>
                <select
                  className={`form-select ${
                    validated
                      ? errors.codigoEan
                        ? "is-invalid"
                        : "is-valid"
                      : ""
                  }`}
                  value={formData.codigoEan}
                  onChange={(e) => handleChange("codigoEan", e.target.value)}
                >
                  <option value="" disabled hidden>
                    {i18n.modalEtiquetadoManual.selectCodigoEan}
                  </option>
                  {eans.map((ean) => (
                    <option key={ean.id} value={ean.codigo_ean}>
                      {ean.codigo_ean}
                    </option>
                  ))}
                </select>
                <div className="invalid-feedback">{errors.codigoEan}</div>
              </div>

              <div className="C-CM1-form-group">
                <label className="form-label">
                  {i18n.modalEtiquetadoManual.fechaProduccionLabel}
                </label>
                <input
                  type="date"
                  className={`form-control ${
                    validated
                      ? errors.fechaProduccion
                        ? "is-invalid"
                        : "is-valid"
                      : ""
                  }`}
                  value={formData.fechaProduccion || ""}
                  onChange={(e) =>
                    handleChange("fechaProduccion", e.target.value)
                  }
                />
                <div className="invalid-feedback">{errors.fechaProduccion}</div>
              </div>

              <div className="C-CM1-form-group">
                <label className="form-label">
                  {i18n.modalEtiquetadoManual.horaProduccionLabel}
                </label>
                <input
                  type="text"
                  className={`form-control ${
                    validated
                      ? errors.horaProduccion
                        ? "is-invalid"
                        : "is-valid"
                      : ""
                  }`}
                  value={formData.horaProduccion || ""}
                  onChange={(e) =>
                    handleChange("horaProduccion", e.target.value)
                  }
                  placeholder="HH:MM"
                />
                <div className="invalid-feedback">{errors.horaProduccion}</div>
              </div>

              <div className="C-CM1-form-group">
                <label className="form-label">
                  {i18n.modalEtiquetadoManual.intervaloMinutosLabel}
                </label>
                <input
                  type="number"
                  className={`form-control ${
                    validated
                      ? errors.intervaloMinutos
                        ? "is-invalid"
                        : "is-valid"
                      : ""
                  }`}
                  value={formData.intervaloMinutos || ""}
                  onChange={(e) =>
                    handleChange("intervaloMinutos", e.target.value)
                  }
                  min="0"
                  max="60"
                  placeholder="0"
                />
                <div className="invalid-feedback">
                  {errors.intervaloMinutos}
                </div>
              </div>

              <div className="C-CM1-form-group">
                <label className="form-label">
                  {i18n.modalEtiquetadoManual.fechaCaducidadLabel}
                </label>
                <input
                  type="date"
                  disabled
                  className={`form-control ${
                    validated
                      ? errors.fechaCaducidad
                        ? "is-invalid"
                        : "is-valid"
                      : ""
                  }`}
                  value={formData.fechaCaducidad || ""}
                  onChange={(e) =>
                    handleChange("fechaCaducidad", e.target.value)
                  }
                />
                <div className="invalid-feedback">{errors.fechaCaducidad}</div>
              </div>

              <div className="C-CM1-form-group">
                <label className="form-label">
                  {i18n.modalEtiquetadoManual.codeLabel}
                </label>
                <input
                  type="text"
                  className={`form-control ${
                    validated ? (errors.code ? "is-invalid" : "is-valid") : ""
                  }`}
                  disabled
                  value={formData.code || ""}
                  onChange={(e) => handleChange("code", e.target.value)}
                  placeholder=""
                />
                <div className="invalid-feedback">{errors.code}</div>
              </div>

              <div className="C-CM1-form-group">
                <label className="form-label">
                  {i18n.modalEtiquetadoManual.ssccLabel}
                </label>
                <input
                  type="text"
                  disabled
                  className={`form-control ${
                    validated ? (errors.sscc ? "is-invalid" : "is-valid") : ""
                  }`}
                  value={formData.sscc || ""}
                  onChange={(e) => handleChange("sscc", e.target.value)}
                  placeholder=""
                />
                <div className="invalid-feedback">{errors.sscc}</div>
              </div>

              <div className="C-CM1-form-group">
                <label className="form-label">
                  {i18n.modalEtiquetadoManual.noLoteLabel}
                </label>
                <input
                  type="text"
                  disabled
                  className={`form-control ${
                    validated ? (errors.noLote ? "is-invalid" : "is-valid") : ""
                  }`}
                  value={formData.noLote || ""}
                  onChange={(e) => handleChange("noLote", e.target.value)}
                />
                <div className="invalid-feedback">{errors.noLote}</div>
              </div>

              <div className="C-CM1-form-group">
                <label className="form-label">
                  {i18n.modalEtiquetadoManual.noMatriculaLabel}
                </label>
                <input
                  type="text"
                  disabled
                  className={`form-control ${
                    validated
                      ? errors.noMatricula
                        ? "is-invalid"
                        : "is-valid"
                      : ""
                  }`}
                  value={formData.noMatricula || ""}
                  onChange={(e) => handleChange("noMatricula", e.target.value)}
                />
                <div className="invalid-feedback">{errors.noMatricula}</div>
              </div>

              <div className="C-CM1-form-group">
                <label className="form-label">
                  {i18n.modalEtiquetadoManual.titulo1Label}
                </label>
                <input
                  type="text"
                  className={`form-control ${
                    validated
                      ? errors.titulo1
                        ? "is-invalid"
                        : "is-valid"
                      : ""
                  }`}
                  value={formData.titulo1 || ""}
                  onChange={(e) => handleChange("titulo1", e.target.value)}
                  placeholder=""
                />
                <div className="invalid-feedback">{errors.titulo1}</div>
              </div>

              <div className="C-CM1-form-group">
                <label className="form-label">
                  {i18n.modalEtiquetadoManual.valor1Label}
                </label>
                <input
                  type="text"
                  className={`form-control ${
                    validated ? (errors.valor1 ? "is-invalid" : "is-valid") : ""
                  }`}
                  value={formData.valor1 || ""}
                  onChange={(e) => handleChange("valor1", e.target.value)}
                  placeholder=""
                />
                <div className="invalid-feedback">{errors.valor1}</div>
              </div>

              <div className="C-CM1-form-group">
                <label className="form-label">
                  {i18n.modalEtiquetadoManual.titulo2Label}
                </label>
                <input
                  type="text"
                  className={`form-control ${
                    validated
                      ? errors.titulo2
                        ? "is-invalid"
                        : "is-valid"
                      : ""
                  }`}
                  value={formData.titulo2 || ""}
                  onChange={(e) => handleChange("titulo2", e.target.value)}
                  placeholder=""
                />
                <div className="invalid-feedback">{errors.titulo2}</div>
              </div>

              <div className="C-CM1-form-group">
                <label className="form-label">
                  {i18n.modalEtiquetadoManual.valor2Label}
                </label>
                <input
                  type="text"
                  className={`form-control ${
                    validated ? (errors.valor2 ? "is-invalid" : "is-valid") : ""
                  }`}
                  value={formData.valor2 || ""}
                  onChange={(e) => handleChange("valor2", e.target.value)}
                  placeholder=""
                />
                <div className="invalid-feedback">{errors.valor2}</div>
              </div>

              <div className="C-CM1-form-group">
                <label className="form-label">
                  {i18n.modalEtiquetadoManual.numeroEtiquetasLabel}
                </label>
                <input
                  type="number"
                  className={`form-control ${
                    validated
                      ? errors.numeroEtiquetas
                        ? "is-invalid"
                        : "is-valid"
                      : ""
                  }`}
                  value={formData.numeroEtiquetas || ""}
                  onChange={(e) =>
                    handleChange("numeroEtiquetas", e.target.value)
                  }
                  min={1}
                  max={20}
                  placeholder=""
                />
                <div className="invalid-feedback">{errors.numeroEtiquetas}</div>
              </div>
            </form>
          </div>

          <div className="modal-footer d-flex justify-content-between gap-3">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleClose}
            >
              {i18n.modalEtiquetadoManual.cancelarBtn}
            </button>
            <button className="btn btn-warning" onClick={handleSubmit}>
              {i18n.modalEtiquetadoManual.imprimirBtn}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalEtiquetadoManual;

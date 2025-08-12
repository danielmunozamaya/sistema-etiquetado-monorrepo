import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Registro.css";
import { register, login, getRoles } from "../../common/services/auth.service";
import { getUserFromToken } from "../../common/services/token.service";
import { activateToast } from "../../components/ToastMessage/helpers/ToastMessage.helpers";
import { useRoleStore } from "../../common/stores/role.store";
import { i18n } from "../../i18n";

const Registro = () => {
  const [nombre, setNombre] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [rol, setRol] = useState("");
  const [roles, setRoles] = useState([]);
  const [rutaImpresion, setRutaImpresion] = useState("");
  const [validated, setValidated] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        let data = await getRoles();
        setRoles(data);
      } catch (err) {
        activateToast({
          message: i18n.registro.errorFetchRoles,
          type: "danger",
        });
      }
    };
    fetchRoles();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;

    const contrasenasCoinciden = password === confirmPassword;
    const rolSeleccionado = rol !== "";

    if (!form.checkValidity() || !contrasenasCoinciden || !rolSeleccionado) {
      setValidated(true);
      return;
    }

    try {
      await register(nombre, password, rol, rutaImpresion);
      activateToast({
        message: i18n.registro.success,
        type: "success",
      });
      setNombre("");
      setPassword("");
      setConfirmPassword("");
      setRol("");
      setRutaImpresion("");
    } catch (error) {
      const mensaje =
        error?.response?.data?.message || i18n.registro.errorUnknown;
      activateToast({
        message: mensaje,
        type: "danger",
      });
    }
  };

  return (
    <div className="auth-container">
      <form
        className={`auth-form ${validated ? "was-validated" : ""}`}
        noValidate
      >
        <h4 className="text-center mb-4">{i18n.registro.title}</h4>

        <div className="register-form-group register-user mb-3">
          <label className="form-label">{i18n.registro.userLabel}</label>
          <input
            type="text"
            className="form-control form-control-sm"
            required
            minLength={6}
            maxLength={40}
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
          <div className="invalid-feedback">{i18n.registro.userInvalid}</div>
        </div>

        <div className="register-form-group mb-3">
          <label className="form-label">{i18n.registro.rutaLabel}</label>
          <input
            type="text"
            className="form-control form-control-sm"
            required
            minLength={1}
            maxLength={50}
            value={rutaImpresion}
            onChange={(e) => setRutaImpresion(e.target.value)}
          />
          <div className="invalid-feedback">{i18n.registro.rutaInvalid}</div>
        </div>

        <div className="register-form-group mb-3">
          <label className="form-label">{i18n.registro.rolLabel}</label>
          <select
            className="form-select form-select-sm"
            required
            value={rol}
            onChange={(e) => setRol(e.target.value)}
          >
            <option value="">{i18n.registro.rolSelect}</option>
            {roles.map((r) => (
              <option key={r.id} value={r.rol}>
                {r.rol}
              </option>
            ))}
          </select>
          <div className="invalid-feedback">{i18n.registro.rolInvalid}</div>
        </div>

        <div className="register-form-group mb-3">
          <label className="form-label">{i18n.registro.passLabel}</label>
          <input
            type="password"
            className="form-control form-control-sm"
            required
            minLength={6}
            maxLength={40}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="invalid-feedback">{i18n.registro.passInvalid}</div>
        </div>

        <div className="register-form-group register-pass mb-3">
          <label className="form-label">{i18n.registro.confirmPassLabel}</label>
          <input
            type="password"
            className={`form-control form-control-sm ${
              validated && password !== confirmPassword ? "is-invalid" : ""
            }`}
            required
            minLength={6}
            maxLength={40}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <div className="invalid-feedback">
            {i18n.registro.confirmPassInvalid}
          </div>
        </div>

        <hr />
        <div className="d-flex justify-content-between">
          <button
            type="button"
            className="btn btn-warning"
            onClick={() => navigate("/login")}
          >
            {i18n.registro.loginBtn}
          </button>
          <button
            type="submit"
            className="btn btn-success"
            onClick={handleSubmit}
          >
            {i18n.registro.registerBtn}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Registro;

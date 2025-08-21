import type { FormEvent } from "react";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import { login } from "../../common/services/auth.service";
import { getUserFromToken } from "../../common/services/token.service";
import { activateToast } from "../../components/ToastMessage/helpers/ToastMessage.helpers";
import { i18n } from "../../i18n";

interface LoginProps {
  isUserAdmin?: boolean;
}

const Login: React.FC<LoginProps> = ({ isUserAdmin }) => {
  const [nombre, setNombre] = useState("");
  const [password, setPassword] = useState("");
  const [validated, setValidated] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;

    if (!form.checkValidity()) {
      setValidated(true);
      return;
    }

    try {
      await login(nombre, password);
      getUserFromToken();
      activateToast({
        message: i18n.login.success,
        type: "success",
      });
      navigate("/");
    } catch (error: any) {
      console.error(
        "Error al iniciar sesión:",
        error.response?.data || error.message
      );
      activateToast({
        message: i18n.login.error,
        type: "danger",
      });
    }
  };

  return (
    <div className="auth-container">
      <form
        className={`auth-form ${validated ? "was-validated" : ""}`}
        noValidate
        onSubmit={handleSubmit}
      >
        <h4 className="text-center mb-4">{i18n.login.title}</h4>

        <div className="login-form-group login-user mb-3">
          <label className="form-label">{i18n.login.userLabel}</label>
          <input
            type="text"
            className="form-control form-control-sm"
            required
            minLength={6}
            maxLength={40}
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
          <div className="invalid-feedback">{i18n.login.userInvalid}</div>
        </div>

        <div className="login-form-group login-pass mb-3">
          <label className="form-label">{i18n.login.passLabel}</label>
          <input
            type="password"
            className="form-control form-control-sm"
            required
            minLength={6}
            maxLength={40}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="invalid-feedback">{i18n.login.passInvalid}</div>
        </div>

        <hr />
        <div
          className={`d-flex ${
            isUserAdmin ? "justify-content-between" : "justify-content-end"
          }`}
        >
          {isUserAdmin && (
            <button
              type="button"
              className="btn btn-warning"
              onClick={() => navigate("/registro")}
            >
              {i18n.login.registerBtn}
            </button>
          )}
          <button type="submit" className="btn btn-success">
            {i18n.login.loginBtn}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Login;

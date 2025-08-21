import "../../modales.css";
import "./ModalCerrarSesion.css";
import { useNavigate } from "react-router-dom";
import { getToken, removeToken } from "../../common/services/token.service";
import { activateToast } from "../ToastMessage/helpers/ToastMessage.helpers";
import { useRoleStore } from "../../common/stores/role.store";
import { i18n } from "../../i18n";

export const ModalCerrarSesion: React.FC = () => {
  const navigate = useNavigate();

  const handleCerrarSesion = () => {
    const token = getToken();

    if (!token) {
      activateToast({
        message: i18n.modalCerrarSesion.noSesion,
        type: "danger",
      });
      return;
    }

    removeToken();

    useRoleStore.getState().clearRole();

    activateToast({
      message: i18n.modalCerrarSesion.success,
      type: "success",
    });

    navigate("/login");
    // No cerramos el modal desde JS: lo hace Bootstrap con `data-bs-dismiss="modal"`
  };

  return (
    <div
      className="modal fade modal-unificado"
      id="modalCerrarSesion"
      tabIndex={-1}
      aria-hidden="true"
    >
      <div className="modal-dialog modal-dialog-centered modal-md">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{i18n.modalCerrarSesion.title}</h5>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body modal-cerrar-sesion-body">
            <p>{i18n.modalCerrarSesion.confirmText}</p>
          </div>
          <div className="modal-footer d-flex justify-content-between gap-3">
            <button
              type="button"
              className="btn btn-secondary"
              data-bs-dismiss="modal"
              aria-label="Close"
            >
              {i18n.modalCerrarSesion.cancelarBtn}
            </button>
            <button
              className="btn btn-danger"
              onClick={handleCerrarSesion}
              data-bs-dismiss="modal"
            >
              {i18n.modalCerrarSesion.cerrarSesionBtn}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

import { useState } from "react";
import "./NavbarOffcanvas.css";
import { NavLink, useLocation } from "react-router-dom";
import { getToken } from "../../common/services/token.service";
import { activateToast } from "../ToastMessage/helpers/ToastMessage.helpers";
import logoConesa from "../../assets/android-chrome-512x512.png";
import {
  USER_ROLE,
  OFFCANVAS_FUNCTIONALITIES,
} from "../../common/constants/shared.constants";
import { i18n } from "../../i18n";

type UserRole =
  | typeof USER_ROLE.ADMINISTRADOR
  | typeof USER_ROLE.ENCARGADO_ASEPTICOS
  | typeof USER_ROLE.ETIQUETADO
  | string;

interface NavbarOffcanvasProps {
  userRole: UserRole;
}

export const NavbarOffcanvas: React.FC<NavbarOffcanvasProps> = ({ userRole }) => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const location = useLocation();
  const isLoggedIn = !!getToken();
  const isUserAdmin = userRole === USER_ROLE.ADMINISTRADOR;

  const roleIsAllowedFor = (functionality: string) => {
    switch (functionality) {
      case OFFCANVAS_FUNCTIONALITIES.VER_LLENADORAS:
      case OFFCANVAS_FUNCTIONALITIES.ASIGNAR_PRODUCTOS:
      case OFFCANVAS_FUNCTIONALITIES.ASIGNAR_LIMITES:
        return (
          userRole === USER_ROLE.ADMINISTRADOR ||
          userRole === USER_ROLE.ENCARGADO_ASEPTICOS
        );
      default:
        return false;
    }
  };

  const closeOffcanvas = () => {
    const offcanvasElement = document.getElementById("offcanvasNavbar");
    if (offcanvasElement && (window as any).bootstrap) {
      const bsOffcanvas = (window as any).bootstrap.Offcanvas.getInstance(offcanvasElement);
      if (bsOffcanvas) {
        bsOffcanvas.hide();
      }
    }
  };

  const handleDropdownClick = (name: string) => {
    setOpenDropdown((prev) => (prev === name ? null : name));
  };

  const handleProtectedClick = (e: React.MouseEvent) => {
    if (!isLoggedIn) {
      e.preventDefault();
      activateToast({
        message: i18n.navbar.mustLogin,
        type: "danger",
      });
      return;
    }
    closeOffcanvas();
  };

  const pathTitles: Record<string, string> = {
    "/": i18n.navbar.llenadorasAuto,
    "/ver-llenadora": i18n.navbar.verEliminarLlenadoras,
    "/produccion": i18n.navbar.verEliminarProduccion,
    "/ver-producto": i18n.navbar.verEliminarProductos,
    "/ver-presentacion": i18n.navbar.verEliminarPresentaciones,
    "/ver-ean": i18n.navbar.verEliminarEan,
    "/asignacion": i18n.navbar.asignarProducto,
    "/etiquetas-semiauto": i18n.navbar.etiquetadoSemiauto,
    "/registro": "",
    "/login": "",
  };

  const currentTitle = pathTitles[location.pathname] || "";

  const path = location.pathname;

  const isLlenadorasActive = path === "/" || path.startsWith("/asignacion");
  const isProductosActive = path.startsWith("/ver-producto");
  const isPresentacionesActive = path.startsWith("/ver-presentacion");
  const isEanActive = path.startsWith("/ver-ean");
  const isEtiquetadoActive = path.startsWith("/etiquetas-semiauto");
  const isUsuarioActive =
    path.startsWith("/registro") || path.startsWith("/login");

  return (
    <nav className="navbar bg-body-tertiary fixed-top position-sticky">
      <div className="container-fluid d-flex align-items-center justify-content-between">
        <NavLink
          className="navbar-brand mb-0 d-flex align-items-center"
          to="/"
          onClick={handleProtectedClick}
        >
          <img
            src={logoConesa}
            alt="Icono Conesa"
            width="30"
            height="30"
            className="me-3"
          />
          {i18n.navbar.sistemaEtiquetado}
        </NavLink>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="offcanvas"
          data-bs-target="#offcanvasNavbar"
          aria-controls="offcanvasNavbar"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div
          className="position-absolute top-50 start-50 translate-middle text-center fw-semibold"
          style={{ fontSize: "1.1rem", whiteSpace: "nowrap" }}
        >
          {currentTitle}
        </div>
      </div>

      <div
        className="offcanvas offcanvas-end"
        tabIndex={-1}
        id="offcanvasNavbar"
        aria-labelledby="offcanvasNavbarLabel"
      >
        <div className="offcanvas-header">
          <h5 className="offcanvas-title" id="offcanvasNavbarLabel">
            {i18n.navbar.menu}
          </h5>
          <button
            type="button"
            className="btn-close"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
          ></button>
        </div>
        <div className="offcanvas-body">
          <ul className="navbar-nav justify-content-end flex-grow-1 pe-3">
            {/* Llenadoras */}
            <li className="nav-item dropdown">
              <a
                className={`nav-link dropdown-toggle${
                  openDropdown === "llenadoras" || isLlenadorasActive
                    ? " show active"
                    : ""
                }`}
                href="#"
                role="button"
                aria-expanded={
                  openDropdown === "llenadoras" || isLlenadorasActive
                }
                onClick={(e) => {
                  e.preventDefault();
                  handleDropdownClick("llenadoras");
                }}
              >
                <i className="bi bi-funnel me-2"></i>
                {i18n.navbar.llenadoras}
              </a>
              <ul
                className={`dropdown-menu${
                  openDropdown === "llenadoras" || isLlenadorasActive
                    ? " show"
                    : ""
                }`}
              >
                <li>
                  <NavLink
                    to="/"
                    className={({ isActive }) =>
                      `dropdown-item${isActive ? " active" : ""}`
                    }
                    onClick={(e) => {
                      handleProtectedClick(e);
                      handleDropdownClick("llenadoras");
                      closeOffcanvas();
                    }}
                  >
                    {i18n.navbar.llenadorasAuto}
                  </NavLink>
                </li>
                {roleIsAllowedFor(OFFCANVAS_FUNCTIONALITIES.VER_LLENADORAS) && (
                  <>
                    <li>
                      <hr className="dropdown-divider" />
                    </li>
                    <li>
                      <NavLink
                        to="/ver-llenadora"
                        className={({ isActive }) =>
                          `dropdown-item${isActive ? " active" : ""}`
                        }
                        onClick={(e) => {
                          handleProtectedClick(e);
                          handleDropdownClick("llenadoras");
                          closeOffcanvas();
                        }}
                      >
                        {i18n.navbar.verEliminar}
                      </NavLink>
                    </li>
                  </>
                )}
                {isUserAdmin && (
                  <>
                    <li>
                      <hr className="dropdown-divider" />
                    </li>
                    <li>
                      <a
                        className="dropdown-item"
                        href="#"
                        {...(isLoggedIn && {
                          "data-bs-toggle": "modal",
                          "data-bs-target": "#ModalCrearLlenadora",
                        })}
                        onClick={handleProtectedClick}
                      >
                        {i18n.navbar.crear}
                      </a>
                    </li>
                  </>
                )}
                {roleIsAllowedFor(
                  OFFCANVAS_FUNCTIONALITIES.ASIGNAR_PRODUCTOS
                ) && (
                  <>
                    <li>
                      <hr className="dropdown-divider" />
                    </li>
                    <li>
                      <a
                        className="dropdown-item"
                        href="#"
                        {...(isLoggedIn && {
                          "data-bs-toggle": "modal",
                          "data-bs-target": "#ModalAsociacionProduccion",
                        })}
                        onClick={handleProtectedClick}
                      >
                        {i18n.navbar.asignarProducto}
                      </a>
                    </li>
                  </>
                )}
                {roleIsAllowedFor(
                  OFFCANVAS_FUNCTIONALITIES.ASIGNAR_LIMITES
                ) && (
                  <>
                    <li>
                      <hr className="dropdown-divider" />
                    </li>
                    <li>
                      <a
                        className="dropdown-item"
                        href="#"
                        {...(isLoggedIn && {
                          "data-bs-toggle": "modal",
                          "data-bs-target": "#ModalModificarLimites",
                        })}
                        onClick={handleProtectedClick}
                      >
                        {i18n.navbar.modificarLimites}
                      </a>
                    </li>
                  </>
                )}
              </ul>
            </li>

            {/* Productos */}
            <li className="nav-item dropdown">
              <a
                className={`nav-link dropdown-toggle${
                  openDropdown === "productos" || isProductosActive
                    ? " show active"
                    : ""
                }`}
                href="#"
                role="button"
                aria-expanded={
                  openDropdown === "productos" || isProductosActive
                }
                onClick={(e) => {
                  e.preventDefault();
                  handleDropdownClick("productos");
                }}
              >
                <i className="bi bi-box-seam me-2"></i>
                {i18n.navbar.productos}
              </a>
              <ul
                className={`dropdown-menu${
                  openDropdown === "productos" || isProductosActive
                    ? " show"
                    : ""
                }`}
              >
                <li>
                  <NavLink
                    to="/ver-producto"
                    className={({ isActive }) =>
                      `dropdown-item${isActive ? " active" : ""}`
                    }
                    onClick={(e) => {
                      handleProtectedClick(e);
                      handleDropdownClick("productos");
                      closeOffcanvas();
                    }}
                  >
                    {i18n.navbar.verEliminar}
                  </NavLink>
                </li>
                {isUserAdmin && (
                  <>
                    <li>
                      <hr className="dropdown-divider" />
                    </li>
                    <li>
                      <a
                        className="dropdown-item"
                        href="#"
                        {...(isLoggedIn && {
                          "data-bs-toggle": "modal",
                          "data-bs-target": "#modalCrearProducto",
                        })}
                        onClick={handleProtectedClick}
                      >
                        {i18n.navbar.crear}
                      </a>
                    </li>
                  </>
                )}
              </ul>
            </li>

            {/* Presentaciones */}
            <li className="nav-item dropdown">
              <a
                className={`nav-link dropdown-toggle${
                  openDropdown === "presentaciones" || isPresentacionesActive
                    ? " show active"
                    : ""
                }`}
                href="#"
                role="button"
                aria-expanded={
                  openDropdown === "presentaciones" || isPresentacionesActive
                }
                onClick={(e) => {
                  e.preventDefault();
                  handleDropdownClick("presentaciones");
                }}
              >
                <i className="bi bi-layout-text-window me-2"></i>
                {i18n.navbar.presentaciones}
              </a>
              <ul
                className={`dropdown-menu${
                  openDropdown === "presentaciones" || isPresentacionesActive
                    ? " show"
                    : ""
                }`}
              >
                <li>
                  <NavLink
                    to="/ver-presentacion"
                    className={({ isActive }) =>
                      `dropdown-item${isActive ? " active" : ""}`
                    }
                    onClick={(e) => {
                      handleProtectedClick(e);
                      handleDropdownClick("presentaciones");
                      closeOffcanvas();
                    }}
                  >
                    {i18n.navbar.verEliminar}
                  </NavLink>
                </li>
                {isUserAdmin && (
                  <>
                    <li>
                      <hr className="dropdown-divider" />
                    </li>
                    <li>
                      <a
                        className="dropdown-item"
                        href="#"
                        {...(isLoggedIn && {
                          "data-bs-toggle": "modal",
                          "data-bs-target": "#modalCrearPresentacion",
                        })}
                        onClick={handleProtectedClick}
                      >
                        {i18n.navbar.crear}
                      </a>
                    </li>
                  </>
                )}
              </ul>
            </li>

            {/* EAN */}
            <li className="nav-item dropdown">
              <a
                className={`nav-link dropdown-toggle${
                  openDropdown === "ean" || isEanActive ? " show active" : ""
                }`}
                href="#"
                role="button"
                aria-expanded={openDropdown === "ean" || isEanActive}
                onClick={(e) => {
                  e.preventDefault();
                  handleDropdownClick("ean");
                }}
              >
                <i className="bi bi-upc-scan me-2"></i>
                {i18n.navbar.codigosEan}
              </a>
              <ul
                className={`dropdown-menu${
                  openDropdown === "ean" || isEanActive ? " show" : ""
                }`}
              >
                <li>
                  <NavLink
                    to="/ver-ean"
                    className={({ isActive }) =>
                      `dropdown-item${isActive ? " active" : ""}`
                    }
                    onClick={(e) => {
                      handleProtectedClick(e);
                      handleDropdownClick("ean");
                      closeOffcanvas();
                    }}
                  >
                    {i18n.navbar.verEliminar}
                  </NavLink>
                </li>
                {isUserAdmin && (
                  <>
                    <li>
                      <hr className="dropdown-divider" />
                    </li>
                    <li>
                      <a
                        className="dropdown-item"
                        href="#"
                        {...(isLoggedIn && {
                          "data-bs-toggle": "modal",
                          "data-bs-target": "#modalCrearEan",
                        })}
                        onClick={handleProtectedClick}
                      >
                        {i18n.navbar.crear}
                      </a>
                    </li>
                  </>
                )}
              </ul>
            </li>

            {/* Producción */}
            <li className="nav-item">
              <NavLink
                to="/produccion"
                className={({ isActive }) =>
                  `nav-link${isActive ? " active" : ""}`
                }
                onClick={(e) => {
                  handleProtectedClick(e);
                  setOpenDropdown(null);
                  closeOffcanvas();
                }}
              >
                <i className="bi bi-boxes me-2"></i>
                {i18n.navbar.produccion}
              </NavLink>
            </li>

            {/* Etiquetado manual */}
            <li className="nav-item dropdown">
              <a
                className={`nav-link dropdown-toggle${
                  openDropdown === "etiquetado" || isEtiquetadoActive
                    ? " show active"
                    : ""
                }`}
                href="#"
                role="button"
                aria-expanded={
                  openDropdown === "etiquetado" || isEtiquetadoActive
                }
                onClick={(e) => {
                  e.preventDefault();
                  handleDropdownClick("etiquetado");
                }}
              >
                <i className="bi bi-printer me-2"></i>
                {i18n.navbar.etiquetadoPersonalizado}
              </a>
              <ul
                className={`dropdown-menu${
                  openDropdown === "etiquetado" || isEtiquetadoActive
                    ? " show"
                    : ""
                }`}
              >
                <li>
                  <NavLink
                    to="/etiquetas-semiauto"
                    className={({ isActive }) =>
                      `dropdown-item${isActive ? " active" : ""}`
                    }
                    onClick={(e) => {
                      handleProtectedClick(e);
                      handleDropdownClick("etiquetado");
                      closeOffcanvas();
                    }}
                  >
                    {i18n.navbar.etiquetadoSemiauto}
                  </NavLink>
                </li>
                <li>
                  <hr className="dropdown-divider" />
                </li>
                <li>
                  <a
                    className="dropdown-item"
                    href="#"
                    {...(isLoggedIn && {
                      "data-bs-toggle": "modal",
                      "data-bs-target": "#ModalEtiquetadoManual",
                    })}
                    onClick={handleProtectedClick}
                  >
                    {i18n.navbar.etiquetadoManual}
                  </a>
                </li>
              </ul>
            </li>

            <hr />

            {/* Usuario */}
            <li className="nav-item dropdown">
              <a
                className={`nav-link dropdown-toggle${
                  openDropdown === "usuario" || isUsuarioActive
                    ? " show active"
                    : ""
                }`}
                href="#"
                role="button"
                aria-expanded={openDropdown === "usuario" || isUsuarioActive}
                onClick={(e) => {
                  e.preventDefault();
                  handleDropdownClick("usuario");
                }}
              >
                <i className="bi bi-person-gear me-2"></i>
                {i18n.navbar.accionesUsuario}
              </a>
              <ul
                className={`dropdown-menu${
                  openDropdown === "usuario" || isUsuarioActive ? " show" : ""
                }`}
              >
                <li>
                  <NavLink
                    to="/login"
                    className={({ isActive }) =>
                      `dropdown-item${isActive ? " active" : ""}`
                    }
                    onClick={closeOffcanvas}
                  >
                    {i18n.navbar.login}
                  </NavLink>
                </li>
                {isUserAdmin && (
                  <>
                    <li>
                      <hr className="dropdown-divider" />
                    </li>
                    <li>
                      <NavLink
                        to="/registro"
                        className={({ isActive }) =>
                          `dropdown-item${isActive ? " active" : ""}`
                        }
                        onClick={closeOffcanvas}
                      >
                        {i18n.navbar.registro}
                      </NavLink>
                    </li>
                  </>
                )}

                <li>
                  <hr className="dropdown-divider" />
                </li>
                <li>
                  <a
                    className="dropdown-item"
                    href="#"
                    {...(isLoggedIn && {
                      "data-bs-toggle": "modal",
                      "data-bs-target": "#modalCerrarSesion",
                    })}
                    onClick={handleProtectedClick}
                  >
                    {i18n.navbar.cerrarSesion}
                  </a>
                </li>
              </ul>
            </li>
          </ul>
          <div className="mt-auto pt-4 text-center small text-secondary">
            Hecho con ❤ por <strong>Tao Technique</strong>
          </div>
        </div>
      </div>
    </nav>
  );
};
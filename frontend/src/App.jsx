import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { useEffect } from "react";
import { setNavigate } from "./common/helpers/router.helper";
import NavbarOffcanvas from "./components/NavbarOffcanvas/NavbarOffcanvas";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import LlenadorasAuto from "./pages/LlenadorasAuto/LlenadorasAuto";
import Produccion from "./pages/Produccion/Produccion";
import VerProductos from "./pages/VerProductos/VerProductos";
import VerPresentaciones from "./pages/VerPresentaciones/VerPresentaciones";
import VerEans from "./pages/VerEans/VerEans";
import LlenadorasSemiauto from "./pages/LlenadorasSemiauto/LlenadorasSemiauto";
import Registro from "./pages/Registro/Registro";
import Login from "./pages/Login/Login";
import ModalModificarLimites from "./components/ModalModificarLimites/ModalModificarLimites";
import ModalCerrarSesion from "./components/ModalCerrarSesion/ModalCerrarSesion";
import ModalCrearProducto from "./components/CreationModals/ModalCrearProducto/ModalCrearProducto";
import ModalCrearPresentacion from "./components/CreationModals/ModalCrearPresentacion/ModalCrearPresentacion";
import ModalCrearEan from "./components/CreationModals/ModalCrearEan/ModalCrearEan";
import ModalAsociacionProduccion from "./components/CreationModals/ModalAsociacionProduccion/ModalAsociacionProduccion";
import ToastMessage from "./components/ToastMessage/ToastMessage";
import DesktopOnlyGuard from "./pages/DesktopOnlyGuard/DesktopOnlyGuard";
import ModalCrearLlenadora from "./components/CreationModals/ModalCrearLlenadora/ModalCrearLlenadora";
import VerLlenadoras from "./pages/VerLlenadoras/VerLlenadoras";
import { useRoleStore } from "./common/stores/role.store";
import ModalEtiquetadoManual from "./components/ModalEtiquetadoManual/ModalEtiquetadoManual";
import { USER_ROLES } from "./common/constants/shared.constants";

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const isUserAdmin = useRoleStore((state) =>
    state.roleIs(USER_ROLES.ADMINISTRADOR)
  );
  const userRole = useRoleStore().getRole();

  const forbiddenRoutesByRole = {
    ADMINISTRADOR: [],
    ENCARGADO_ASEPTICOS: [
      "/registro",
    ],
    ETIQUETADO: [
      "/registro",
    ],
    OTHER: [
      "/registro",
      // "/ver-llenadora",
      // "/ver-producto",
      // "/ver-presentacion",
      // "/ver-ean",
    ],
  };

  useEffect(() => {
    const currentPath = location.pathname;

    let forbiddenRoutes = [];

    switch(userRole){
      case USER_ROLES.ADMINISTRADOR:
        forbiddenRoutes = forbiddenRoutesByRole.ADMINISTRADOR;
        break;
      case USER_ROLES.ENCARGADO_ASEPTICOS:
        forbiddenRoutes = forbiddenRoutesByRole.ENCARGADO_ASEPTICOS;
        break;
      case USER_ROLES.ETIQUETADO:
        forbiddenRoutes = forbiddenRoutesByRole.ETIQUETADO;
        break;
      default:
        forbiddenRoutes = forbiddenRoutesByRole.OTHER;
        break;
    }

    if (forbiddenRoutes.includes(currentPath)) {
      navigate("/", { replace: true });
    }
  }, [isUserAdmin, location.pathname, navigate]);

  useEffect(() => {
    setNavigate(navigate);
  }, [navigate]);

  return (
    <DesktopOnlyGuard>
      <>
        <NavbarOffcanvas userRole={userRole} />
        <div className="container mt-4">
          <Routes>
            {/* Rutas públicas */}
            <Route
              path="/login"
              element={<Login isUserAdmin={isUserAdmin} />}
            />

            {/* Rutas protegidas */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <LlenadorasAuto />
                </ProtectedRoute>
              }
            />
            <Route
              path="/registro"
              element={
                <ProtectedRoute>
                  <Registro />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ver-llenadora"
              element={
                <ProtectedRoute>
                  <VerLlenadoras userRole={userRole} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/produccion"
              element={
                <ProtectedRoute>
                  <Produccion />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ver-producto"
              element={
                <ProtectedRoute>
                  <VerProductos userRole={userRole} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ver-presentacion"
              element={
                <ProtectedRoute>
                  <VerPresentaciones userRole={userRole} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ver-ean"
              element={
                <ProtectedRoute>
                  <VerEans userRole={userRole} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/etiquetas-semiauto"
              element={
                <ProtectedRoute>
                  <LlenadorasSemiauto />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>

        <ModalEtiquetadoManual />
        <ModalAsociacionProduccion isUserAdmin={isUserAdmin} />
        <ModalCrearLlenadora />
        <ModalCrearProducto />
        <ModalCrearPresentacion />
        <ModalCrearEan />
        <ModalModificarLimites />
        <ModalCerrarSesion />
        <ToastMessage />
      </>
    </DesktopOnlyGuard>
  );
}

export default App;

import { Navigate } from "react-router-dom";
import { getToken } from "../../common/services/token.service";

const ProtectedRoute = ({ children }) => {
  const token = getToken();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;

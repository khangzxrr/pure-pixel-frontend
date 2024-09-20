import { Navigate } from "react-router-dom";
import { useKeycloak } from "@react-keycloak/web";
import UserService from "../services/Keycloak";

const ProtectedRoute = ({ children }) => {
  const { keycloak } = useKeycloak();

  if (!UserService.isLoggedIn()) {
    keycloak.login();
    return null;
  }

  return children;
};

export default ProtectedRoute;

import { useKeycloak } from "@react-keycloak/web";
import UserService from "../services/Keycloak";

const ProtectByRole = ({ children, roles }) => {
  const { keycloak } = useKeycloak();

  if (UserService.hasRole(roles)) {
    keycloak.login();

    return null;
  }

  return children;
};

export default ProtectedRoute;

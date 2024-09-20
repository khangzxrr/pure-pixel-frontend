// import { useNavigate } from "react-router-dom";
import { useKeycloak } from "@react-keycloak/web";
import UserService from "../services/Keycloak";

export const useAuth = () => {
  const { keycloak } = useKeycloak();

  //   const navigate = useNavigate();
  const userData = UserService.getTokenParsed();

  const handleAuthAction = (action) => {
    if (action === "login") keycloak.login();
    if (action === "logout") keycloak.logout();
  };

  return { handleAuthAction, keycloak, userData };
};

import { useNavigate } from "react-router-dom";
import React from "react";
import { useKeycloak } from "@react-keycloak/web";

//checkRoles bay gio co the nhan 1 mang cac role
const ProtectRoute = ({ children, checkRoles }) => {
  const navigate = useNavigate();
  const { keycloak } = useKeycloak();
  const roles =
    keycloak.tokenParsed?.resource_access?.[keycloak.clientId]?.roles;
  
  if (!keycloak?.authenticated) {
    keycloak.login();

    return;
  }

  for (let role of roles) {
    if (checkRoles.includes(role)) {
      return <>{children}</>;
    }
  }

  navigate("/");
};

export default ProtectRoute;

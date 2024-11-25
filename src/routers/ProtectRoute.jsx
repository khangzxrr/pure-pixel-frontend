import { useNavigate } from "react-router-dom";
import React from "react";
import { useKeycloak } from "@react-keycloak/web";

//checkRoles bay gio co the nhan 1 mang cac role
const ProtectRoute = ({ children, checkRoles }) => {
  const navigate = useNavigate();
  const { keycloak } = useKeycloak();

  if (!keycloak.authenticated) {
    navigate("/");
  }

  const roles =
    keycloak.tokenParsed?.resource_access?.[keycloak.clientId]?.roles;

  let hasRole = false;

  if (roles) {
    for (let role of roles) {
      if (checkRoles.includes(role)) {
        hasRole = true;
        break;
      }
    }

    if (hasRole) {
      return <>{children}</>;
    }
  }

  navigate("/");
};

export default ProtectRoute;

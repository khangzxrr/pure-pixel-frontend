import { Outlet, useNavigate } from "react-router-dom";
import React, { useEffect } from "react";
import UserService from "../services/Keycloak";
import ErrorPage from "../pages/ErrorPage";
import { useKeycloak } from "@react-keycloak/web";

//checkRoles bay gio co the nhan 1 mang cac role
const ProtectRoute = ({ children, checkRoles }) => {
  const navigate = useNavigate();
  const { keycloak } = useKeycloak();
  const roles =
    keycloak.tokenParsed?.resource_access?.[keycloak.clientId]?.roles;

  useEffect(() => {
    for (let role of roles) {
      if (checkRoles.includes(role)) {
        return;
      }
    }

    navigate("/", { replace: true });
  }, [roles, checkRoles]);

  return <>{children}</>;
};

export default ProtectRoute;

import { Outlet, useNavigate } from "react-router-dom";
import React, { useEffect } from "react";
import UserService from "../services/Keycloak";
import ErrorPage from "../pages/ErrorPage";
import { useKeycloak } from "@react-keycloak/web";
const ProtectRoute = ({ children, checkRole }) => {
  const navigate = useNavigate();
  const { keycloak } = useKeycloak();
  const userDataKeyCloak = UserService.getTokenParsed();
  const roles = userDataKeyCloak?.resource_access?.purepixel?.roles[0];
  const clientRoles =
    keycloak?.tokenParsed?.resource_access?.[keycloak.clientId]?.roles || [];

  const hasRole = clientRoles.includes(checkRole);

  if (hasRole) {
    console.log(`${checkRole} is present in clientRoles`);
  } else {
    console.log(`${checkRole} is not present in clientRoles`);
  }
  useEffect(() => {
    if (!hasRole) {
      navigate("/", { replace: true });
    }
  }, [roles, checkRole]);

  if (hasRole) {
    return <>{children}</>;
  }
};

export default ProtectRoute;

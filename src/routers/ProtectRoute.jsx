import { Outlet, useNavigate } from "react-router-dom";
import React, { useEffect } from "react";
import UserService from "../services/Keycloak";
import ErrorPage from "../pages/ErrorPage";
const ProtectRoute = ({ children, checkRole }) => {
  const navigate = useNavigate();
  const userDataKeyCloak = UserService.getTokenParsed();

  const roles = userDataKeyCloak?.resource_access?.purepixel?.roles[0];

  // if (checkRole?.includes(roles)) {
  //   console.log("Role is included:", checkRole);
  // } else {
  //   console.log("Role is not included:", checkRole);
  // }
  // console.log(
  //   "Protect Route",
  //   checkRole?.includes(roles),
  //   checkRole,
  //   roles,
  //   userDataKeyCloak
  // );
  useEffect(() => {
    if (!checkRole?.includes(roles)) {
      navigate("/", { replace: true });
    }
  }, [roles, navigate, checkRole]);

  if (checkRole?.includes(roles)) {
    return <>{children}</>;
  }
};

export default ProtectRoute;

import { useNavigate } from "react-router-dom";
import React, { useEffect } from "react";
import { useKeycloak } from "@react-keycloak/web";

const ProtectRoute = ({ children, checkRoles }) => {
  const navigate = useNavigate();
  const { keycloak } = useKeycloak();

  useEffect(() => {
    // Kiểm tra nếu người dùng chưa đăng nhập
    if (!keycloak.authenticated) {
      navigate("/");
      return;
    }

    // Lấy vai trò của người dùng từ token
    const roles =
      keycloak.tokenParsed?.resource_access?.[keycloak.clientId]?.roles;
    console.log(roles);

    // Nếu không có vai trò hoặc không có vai trò phù hợp
    if (!roles || !checkRoles.some((role) => roles.includes(role))) {
      navigate("/");
    }
  }, [keycloak, checkRoles, navigate]);

  // Nếu đủ điều kiện, hiển thị nội dung con
  return <>{children}</>;
};

export default ProtectRoute;

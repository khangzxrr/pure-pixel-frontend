import { useKeycloak } from "@react-keycloak/web";
import React from "react";
import { IoMdClose } from "react-icons/io";

const LoginWarningModal = ({ onCloseLogin }) => {
  const { keycloak } = useKeycloak();

  const handleLogin = () => keycloak.login();
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onCloseLogin();
    }
  };
  return (
    <div className="relative flex flex-col gap-3 justify-center items-center ">
      <div className="text-white">
        Bạn cần đăng nhập tài khoản để sử dụng được tính năng này
      </div>
      <button
        onClick={handleLogin}
        className="bg-[#eee] px-4 py-2 rounded-md text-[#202225]"
      >
        Đăng nhập
      </button>
    </div>
  );
};

export default LoginWarningModal;

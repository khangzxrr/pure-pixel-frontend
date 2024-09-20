import React from "react";
import { useKeycloak } from "@react-keycloak/web";
import { Link, useNavigate } from "react-router-dom";
import HeaderTabs from "./HeaderTabs";
import { Dropdown } from "antd";
import { DropdownMenu, menu } from "./DropdownMenu";
import { useQueries } from "@tanstack/react-query";
import UserApi from "../../apis/UserApi";
import UserService from "../../services/Keycloak";

export default function Header() {
  const { keycloak } = useKeycloak();
  const navigate = useNavigate();
  const userData = UserService.getTokenParsed();
  // console.log(keycloak, userData, "keycloak");

  const handleAuthAction = (action) => {
    if (action === "login") keycloak.login();
    if (action === "logout") keycloak.logout();
    if (action === "navigate") navigate("/customer");
    if (action === "upload-photo") navigate("/upload-photo");
  };

  const renderAuthButtons = () => {
    if (!keycloak) return <div>Loading...</div>;

    return keycloak.authenticated ? (
      <>
        <div className="text-lg  hover:text-blue-600 transition-colors duration-200">
          <Dropdown
            overlay={
              <DropdownMenu
                handleAuthAction={handleAuthAction}
                userId={UserService.getUserId()}
              />
            }
            trigger={["click"]}
            placement="bottomRight"
          >
            <div className="flex items-center gap-2 hover:cursor-pointer">
              <div className="h-8 w-8 overflow-hidden rounded-full outline outline-2">
                <img
                  className="w-full h-full  object-cover  "
                  src="https://vnn-imgs-a1.vgcloud.vn/image1.ictnews.vn/_Files/2020/03/17/trend-avatar-1.jpg"
                  alt=""
                />
              </div>
              <div className="hidden lg:block">{userData.name}</div>
            </div>
          </Dropdown>
        </div>

        <div className="  hover:text-blue-600 outline outline-1 outline-offset-2 rounded-full px-3 py-1 transition-colors duration-200">
          <button onClick={() => handleAuthAction("upload-photo")}>
            Tải lên ảnh
          </button>
        </div>
      </>
    ) : (
      <>
        <button
          onClick={() => handleAuthAction("login")}
          className="text-lg  hover:text-blue-600 transition-colors duration-200"
        >
          Đăng nhập
        </button>
        <button
          onClick={() => handleAuthAction("login")}
          className="text-lg  hover:text-blue-600 ml-5 px-3 py-0.25 outline outline-1 outline-offset-2 rounded-full transition-colors duration-200"
        >
          Đăng ký
        </button>
      </>
    );
  };

  return (
    <div className="flex justify-between items-center h-20 bg-gray-200">
      <HeaderTabs />
      <div className="flex mr-5 items-center gap-5">{renderAuthButtons()}</div>
    </div>
  );
}

import React from "react";
import { IoIosArrowBack } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import UserProfileApi from "../../apis/UserProfile";
import { useQuery } from "@tanstack/react-query";
import { useKeycloak } from "@react-keycloak/web";
import { RiLogoutBoxLine } from "react-icons/ri";

const UpgradeNav = () => {
  const navigate = useNavigate();

  const { keycloak } = useKeycloak();
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["me"],
    queryFn: () => UserProfileApi.getMyProfile(),
    staleTime: 60000,
    cacheTime: 300000,
  });

  const handleLogout = () => keycloak.logout();
  const handleLogin = () => keycloak.login();
  const handleRegister = () => keycloak.register();

  return (
    <div className="bg-[#383c42] h-[60px] flex justify-between items-center p-2">
      <div
        onClick={() => navigate("/")}
        className="m-1 p-2 flex items-center gap-2 rounded-full bg-[#292b2f] hover:cursor-pointer transition duration-200 hover:bg-[#4f545c] relative"
      >
        <IoIosArrowBack className="size-5" />
        <div className="hidden lg:block">Về trang chủ</div>
      </div>
      {data ? (
        <div className="flex items-center gap-2">
          <div
            onClick={() => navigate("/profile")}
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-[#4f545c] hover:cursor-pointer transition duration-200"
          >
            <div className="size-8 overflow-hidden rounded-full">
              <img
                src={data?.avatar}
                alt=""
                className="size-full object-cover"
              />
            </div>
            <div>{data?.name}</div>
          </div>
          <div
            onClick={handleLogout}
            title="Đăng xuất"
            className="hover:cursor-pointer hover:bg-red-500 transition duration-200  p-[5px] rounded-md"
          >
            <RiLogoutBoxLine className="size-7" />
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <div
            onClick={handleRegister}
            className="flex items-center px-2 py-1 bg-[#eee] transition duration-200 hover:cursor-pointer hover:bg-[#a6a6a6] text-[#202225] rounded-lg"
          >
            Đăng ký
          </div>
          <div
            onClick={handleLogin}
            className="flex items-center px-2 py-1 border text-[#eee] rounded-lg hover:bg-[#4f4f4f] transition duration-200 hover:cursor-pointer"
          >
            Đăng nhập
          </div>
        </div>
      )}
    </div>
  );
};

export default UpgradeNav;

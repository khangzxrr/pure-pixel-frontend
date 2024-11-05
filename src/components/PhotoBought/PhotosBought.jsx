import { useKeycloak } from "@react-keycloak/web";
import React from "react";
import UserService from "../../services/Keycloak";
import PhotoProfile from "../PhotoProfile/PhotoProfile";
import { useNavigate } from "react-router-dom";

const PhotosBought = () => {
  const { keycloak } = useKeycloak();
  const userData = UserService.getTokenParsed();
  const navigate = useNavigate();
  return (
    <div className="flex flex-col gap-1 p-1">
      <div className="p-[24px]  bg-[#292b2f]">
        <PhotoProfile userData={userData} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        <div
          onClick={() => navigate(`/profile/photo-bought/${456}`)}
          className="group relative w-full h-[300px] overflow-hidden rounded-lg"
        >
          <img
            src="https://picsum.photos/1920/1080?random=1"
            alt=""
            className="w-full h-full object-cover hover:cursor-pointer group-hover:scale-110 transition-all duration-300"
          />
          <div className="absolute bottom-0 w-full h-[50px] bg-[rgba(0,0,0,0.75)]">
            <div className="flex items-center justify-between h-full px-2">
              <div>tiêu đề</div>
              <div>đã mua ngày: 5/11/2024</div>
            </div>
          </div>
        </div>

        <div
          onClick={() => navigate(`/profile/photo-bought/${123}`)}
          className="group relative w-full h-[300px] overflow-hidden rounded-lg"
        >
          <img
            src="https://picsum.photos/1920/1080?random=2"
            alt=""
            className="w-full h-full object-cover hover:cursor-pointer group-hover:scale-110 transition-all duration-300"
          />
          <div className="absolute bottom-0 w-full h-[50px] bg-[rgba(0,0,0,0.75)]">
            <div className="flex items-center justify-between h-full px-2">
              <div>tiêu đề</div>
              <div>đã mua ngày: 5/11/2024</div>
            </div>
          </div>
        </div>

        <div
          onClick={() => navigate(`/profile/photo-bought/${321}`)}
          className="group relative w-full h-[300px] overflow-hidden rounded-lg"
        >
          <img
            src="https://picsum.photos/1920/1080?random=3"
            alt=""
            className="w-full h-full object-cover hover:cursor-pointer group-hover:scale-110 transition-all duration-300"
          />
          <div className="absolute bottom-0 w-full h-[50px] bg-[rgba(0,0,0,0.75)]">
            <div className="flex items-center justify-between h-full px-2">
              <div>tiêu đề</div>
              <div>đã mua ngày: 5/11/2024</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotosBought;

import { useKeycloak } from "@react-keycloak/web";
import React from "react";
import UserService from "../../services/Keycloak";
import PhotoProfile from "../PhotoProfile/PhotoProfile";
import { useNavigate } from "react-router-dom";
import PhotoExchange from "../../apis/PhotoExchange";
import { useQuery } from "@tanstack/react-query";

const PhotosBought = () => {
  const { keycloak } = useKeycloak();
  const userData = UserService.getTokenParsed();
  const navigate = useNavigate();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["photo-bought"],
    queryFn: () => PhotoExchange.getPhotoBought(),
  });

  const photoBoughtList = data;

  return (
    <div className="flex flex-col gap-1 p-1">
      <div className="p-[24px]  bg-[#292b2f]">
        <PhotoProfile userData={userData} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        {photoBoughtList?.map((photo) => (
          <div
            onClick={() => navigate(`/profile/photo-bought/${photo.id}`)}
            className="group relative w-full h-[300px] overflow-hidden rounded-lg"
            key={photo.id}
          >
            <img
              src={`${photo.signedUrl.thumbnail}`}
              alt=""
              className="w-full h-full object-cover hover:cursor-pointer group-hover:scale-110 transition-all duration-300"
            />
            <div className="absolute bottom-0 w-full h-[50px] bg-[rgba(0,0,0,0.75)]">
              <div className="flex items-center justify-between h-full px-2">
                <div className="flex items-center gap-2">
                  <div className="size-[30px] overflow-hidden rounded-full bg-[#eee]">
                    <img
                      src={photo.photographer.avatar}
                      alt=""
                      className="size-full object-cover"
                    />
                  </div>
                  <div>{photo.photographer.name}</div>
                </div>
                <div className="truncate max-w-[100px]">{photo.title}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PhotosBought;

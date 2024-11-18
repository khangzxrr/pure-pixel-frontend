import { useKeycloak } from "@react-keycloak/web";
import React, { useState } from "react";
import UserService from "../../services/Keycloak";
import PhotoProfile from "../PhotoProfile/PhotoProfile";
import { useNavigate } from "react-router-dom";
import PhotoExchange from "../../apis/PhotoExchange";
import { useQuery } from "@tanstack/react-query";
import UseUserOtherStore from "../../states/UseUserOtherStore";
import { ConfigProvider, Pagination } from "antd";
import LoadingSpinner from "./../LoadingSpinner/LoadingSpinner";

const PhotosBought = () => {
  const { keycloak } = useKeycloak();
  const userData = UserService.getTokenParsed();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const itemsPerPage = 6;
  const setNameUserOther = UseUserOtherStore((state) => state.setNameUserOther);
  const setUserOtherId = UseUserOtherStore((state) => state.setUserOtherId);
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["photo-bought", page],
    queryFn: () => PhotoExchange.getPhotoBought(itemsPerPage, page - 1),
    keepPreviousData: true,
  });
  const totalPages = data?.totalPage || 1;
  console.log(data);
  const handlePageClick = (pageNumber) => {
    if (pageNumber !== page) {
      setPage(pageNumber);
    }
  };
  return (
    <ConfigProvider
      theme={{
        token: {
          colorBgContainer: "#1e1e1e",
          colorText: "#b3b3b3",
          colorPrimary: "white",
          colorBgTextHover: "#333333",
          colorBgTextActive: "#333333",
          colorTextDisabled: "#666666",
        },
      }}
    >
      <div className="flex flex-col gap-1 p-1">
        <div className="p-[24px]  bg-[#292b2f]">
          <PhotoProfile userData={userData} />
        </div>
        <div className="flex flex-col gap-1">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {isLoading && (
              <div className="colspan-1 md:colspan-2 lg:colspan-3">
                <div className="flex items-center justify-center">
                  <LoadingSpinner />
                </div>
              </div>
            )}
            {data?.objects?.map((photo) => (
              <div
                className="group relative w-full h-[300px] overflow-hidden rounded-lg"
                key={photo.id}
              >
                <img
                  onClick={() => navigate(`/profile/photo-bought/${photo.id}`)}
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
                      <div
                        className="hover:underline underline-offset-2 hover:cursor-pointer truncate max-w-[150px]"
                        onClick={() => {
                          navigate(`/user/${photo.photographer.id}/photos`);
                          setNameUserOther(photo.photographer.name);
                          setUserOtherId(photo.photographer.id);
                        }}
                      >
                        {photo.photographer.name}
                      </div>
                    </div>
                    <div className="truncate max-w-[100px]">{photo.title}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {totalPages > 0 && (
            <Pagination
              current={page}
              total={totalPages * itemsPerPage}
              onChange={handlePageClick}
              pageSize={itemsPerPage}
              showSizeChanger={false}
              className="flex justify-end my-2"
            />
          )}
        </div>
      </div>
    </ConfigProvider>
  );
};

export default PhotosBought;

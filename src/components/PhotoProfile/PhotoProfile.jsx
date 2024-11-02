import React from "react";
import UserService from "../../services/Keycloak";
import { IoEyeSharp } from "react-icons/io5";
import StorageBar from "./StorageBar";
import UserApi from "../../apis/UserApi";
import { useQuery } from "@tanstack/react-query";

const PhotoProfile = ({ userData }) => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["me"],
    queryFn: () => UserApi.getApplicationProfile(),
    staleTime: 60000,
    cacheTime: 300000,
  });

  const quotaTotal = data?.maxPhotoQuota;
  const quotaUsed = data?.photoQuotaUsage;

  return (
    <div className="flex flex-col md:flex-row  justify-center md:justify-between ">
      <div className="flex flex-col md:flex-row items-center gap-5">
        <div className="w-[120px] h-[120px] overflow-hidden rounded-full">
          <img
            className="w-full h-full object-cover bg-[#eee]"
            src={data?.avatar}
            alt=""
          />
        </div>
        <div className="flex flex-col  gap-2 p-1">
          <div className="font-bold text-4xl">
            {userData?.name || "Không xác định"}
          </div>
          <div className="pl-1 font-normal">
            {userData?.email || "Không xác định"}
          </div>
          <div className="flex gap-2">
            <div className="px-[12px] py-[4px] bg-[#fff3] rounded-full">
              2 người theo dõi
            </div>
            <div className="flex items-center gap-1 px-[12px] py-[4px] bg-[#fff3] rounded-full">
              64 <IoEyeSharp />
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-center md:justify-start">
        <StorageBar used={quotaUsed} total={quotaTotal} />
      </div>
    </div>
  );
};

export default PhotoProfile;

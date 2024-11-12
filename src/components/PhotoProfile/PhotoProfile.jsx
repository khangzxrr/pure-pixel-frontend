import React from "react";
import UserService from "../../services/Keycloak";
import { IoEyeSharp } from "react-icons/io5";
import StorageBar from "./StorageBar";
import UserApi from "../../apis/UserApi";
import { useQuery } from "@tanstack/react-query";
import UpgradeToPtg from "./UpgradeToPtg";
import { FaImages } from "react-icons/fa6";
import ViewFollowingsModal from "./ViewFollowingsModal";
import ViewFollowersModal from "./ViewFollowersModal";

const PhotoProfile = ({ userData }) => {
  const [showModal, setShowModal] = React.useState(false);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["me"],
    queryFn: () => UserApi.getApplicationProfile(),
    staleTime: 60000,
    cacheTime: 300000,
  });

  const PhotoTotal = data?._count?.photos;
  const FollowingsCount = data?._count?.followings;
  const UserAvarta = data?.avatar;
  const quotaTotal = data?.maxPhotoQuota;
  const quotaUsed = data?.photoQuotaUsage;

  const handleOpenFollowersModal = () => {
    setShowModal(true);
  };

  const handleCloseFollowersModal = () => {
    setShowModal(false);
  };
  return (
    <>
      {showModal && <ViewFollowersModal onClose={handleCloseFollowersModal} />}
      <div className="flex flex-col md:flex-row  justify-center md:justify-between ">
        <div className="flex flex-col md:flex-row items-center gap-5">
          <div className="w-[120px] h-[120px] overflow-hidden rounded-full">
            <img
              className="w-full h-full object-cover bg-[#eee]"
              src={UserAvarta}
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
              <div
                onClick={handleOpenFollowersModal}
                className="px-[12px] py-[4px] bg-[#fff3] rounded-full hover:cursor-pointer hover:bg-[#ffffff67] transition duration-200"
              >
                {FollowingsCount} người theo dõi
              </div>
              <div className="flex items-center gap-1 px-[12px] py-[4px] bg-[#fff3] rounded-full">
                {PhotoTotal} <FaImages />
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-center md:justify-start">
          {userData?.resource_access?.purepixel?.roles.includes(
            "photographer"
          ) ? (
            <StorageBar used={quotaUsed} total={quotaTotal} />
          ) : (
            <div>
              <UpgradeToPtg />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default PhotoProfile;

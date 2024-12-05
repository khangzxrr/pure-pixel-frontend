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
import UserProfileApi from "../../apis/UserProfile";
import { FormatDateTime } from "./../../utils/FormatDateTimeUtils";
import calculateRemainingTime from "./../../utils/calculateRemainingTime";

const PhotoProfile = ({ userData }) => {
  const [showFollowersModal, setFollowersShowModal] = React.useState(false);
  const [showFollowingsModal, setFollowingsShowModal] = React.useState(false);
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["me"],
    queryFn: () => UserApi.getApplicationProfile(),
    staleTime: 60000,
    cacheTime: 300000,
  });

  const {
    data: currentUpgradedPackage,
    isLoading: isCurrentUpgradedPackageLoading,
    isError: isCurrentUpgradedPackageError,
    error: currentUpgradedPackageError,
  } = useQuery({
    queryKey: ["currentUpgradedPackage"],
    queryFn: () => UserProfileApi.getCurrentUpgradedPackage(),
    staleTime: 60000,
    cacheTime: 300000,
  });

  if (isCurrentUpgradedPackageLoading) return <div>Loading...</div>;
  if (isCurrentUpgradedPackageError) return <div>Error: {error.message}</div>;
  const currentUpgradedPackageName =
    currentUpgradedPackage?.upgradePackageHistory?.name;

  const expiredAt = FormatDateTime(currentUpgradedPackage.expiredAt);
  const remainingDays = calculateRemainingTime(
    currentUpgradedPackage.expiredAt
  );

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error: {error.message}</div>;

  const PhotoTotal = data?._count?.photos;
  const PhotoSellCount = data?.sellingPhotoCount;
  const FollowingsCount = data?._count?.followings;
  const FollowersCount = data?._count?.followers;
  const UserAvarta = data?.avatar;
  const quotaTotal = data?.maxPhotoQuota;
  const quotaUsed = data?.photoQuotaUsage;

  const handleOpenFollowersModal = () => {
    setFollowersShowModal(true);
  };

  const handleCloseFollowersModal = () => {
    setFollowersShowModal(false);
  };

  const handleOpenFollowingsModal = () => {
    setFollowingsShowModal(true);
  };

  const handleCloseFollowingsModal = () => {
    setFollowingsShowModal(false);
  };

  return (
    <>
      {showFollowersModal && (
        <ViewFollowersModal onClose={handleCloseFollowersModal} />
      )}
      {showFollowingsModal && (
        <ViewFollowingsModal onClose={handleCloseFollowingsModal} />
      )}
      <div className="flex flex-col md:flex-row  justify-center md:justify-between">
        <div className="flex flex-col md:flex-row items-center gap-5">
          <div className="w-[120px] h-[120px] overflow-hidden rounded-full">
            <img
              className="w-full h-full object-cover bg-[#eee]"
              src={UserAvarta}
              alt=""
            />
          </div>
          <div className="flex flex-col  gap-2 p-1">
            <div className="font-bold text-4xl flex items-center gap-2">
              {data?.name || "Không xác định"}
              <div></div>
            </div>
            <div className="pl-1 font-normal">
              {userData?.email || "Không xác định"}
            </div>
            <div className="flex  gap-2 transition-all duration-200">
              <div className="flex gap-2">
                <div
                  onClick={handleOpenFollowersModal}
                  className="px-[12px] py-[4px] bg-[#fff3] rounded-full hover:cursor-pointer hover:bg-[#ffffff67] transition duration-200"
                >
                  <span className="font-normal">Người theo dõi: </span>
                  {FollowersCount}
                </div>
                <div
                  onClick={handleOpenFollowingsModal}
                  className="px-[12px] py-[4px] bg-[#fff3] rounded-full hover:cursor-pointer hover:bg-[#ffffff67] transition duration-200"
                >
                  <span className="font-normal">Đang theo dõi: </span>{" "}
                  {FollowingsCount}
                </div>
              </div>
              <div className="flex gap-2">
                <div className="flex items-center gap-1 px-[12px] py-[4px] bg-[#fff3] rounded-full">
                  <span className="font-normal">Tổng số ảnh: </span>
                  {PhotoTotal}
                </div>
                <div className="flex items-center gap-1 px-[12px] py-[4px] bg-[#fff3] rounded-full">
                  <span className="font-normal">Số ảnh đang bán: </span>{" "}
                  {PhotoSellCount}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-center md:justify-start">
          {userData?.resource_access?.purepixel?.roles.includes(
            "photographer"
          ) ? (
            <StorageBar
              used={quotaUsed}
              total={quotaTotal}
              nameCurrentPackage={currentUpgradedPackageName}
              expiredAt={expiredAt}
              remainingDays={remainingDays}
            />
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

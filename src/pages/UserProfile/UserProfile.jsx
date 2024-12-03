// Profile.jsx
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import ProfileLayout from "../../layouts/ProfileLayout";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import UserProfileApi from "../../apis/UserProfile";
import { HiOutlineLocationMarker } from "react-icons/hi";
import { FaFacebook, FaInstagram } from "react-icons/fa6";
import { CiGlobe } from "react-icons/ci";
import UserService from "../../services/Keycloak";
import LoadingProfile from "../../components/UserProfile/LoadingProfile";
import SkeletonLine from "../../components/UI/Skeleton/SkeletonLine";
import SkeletonImage from "../../components/UI/Skeleton/SkeletonImage";
import UpdateProfileModal from "../../components/ProfileDetail/UpdateProfileModal";
import { IoPencil } from "react-icons/io5";
import useModalStore from "../../states/UseModalStore";
import { Tooltip } from "antd";
import { FormatDateTime } from "../../utils/FormatDateTimeUtils";
import calculateRemainingTime from "../../utils/calculateRemainingTime";
import { FaShareAlt } from "react-icons/fa";
import { BiShareAlt } from "react-icons/bi";
import { notificationApi } from "../../Notification/Notification";

const UserProfile = () => {
  const { setIsUpdateProfileModalVisible } = useModalStore();
  const navigate = useNavigate();

  const { userId } = useParams();
  const userDataKeyCloak = UserService.getTokenParsed();

  const { data: userData, isLoading } = useQuery({
    queryKey: ["user-profile", userId],
    queryFn: () => UserProfileApi.getMyProfile(userId),
  });

  console.log("userData", userData);

  const {
    data: currentUpgradedPackage,
    isLoading: isCurrentUpgradedPackageLoading,
    isError: isCurrentUpgradedPackageError,
    error: currentUpgradedPackageError,
  } = useQuery({
    queryKey: ["current-upgraded-package"],
    queryFn: () => UserProfileApi.getCurrentUpgradedPackage(),
  });

  const openModal = () => {
    setIsUpdateProfileModalVisible(true);
  };

  const [scrollY, setScrollY] = useState(0);
  const defaultHeight = 350;

  // Calculate container height based on scroll position
  const containerHeight = scrollY < 400 ? defaultHeight - scrollY * 0.5 : 0;
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (isCurrentUpgradedPackageLoading) return <LoadingProfile />;
  if (isCurrentUpgradedPackageError) return <div>Error: {error.message}</div>;
  const currentUpgradedPackageName =
    currentUpgradedPackage?.upgradePackageHistory?.name;

  const expiredAt = FormatDateTime(currentUpgradedPackage.expiredAt);
  const remainingDays = calculateRemainingTime(
    currentUpgradedPackage.expiredAt
  );

  function formatNumber(num) {
    if (num >= 1000000) {
      // For numbers greater than or equal to 1 million
      return (
        (num / 1000000).toFixed(2).replace(".", ",").replace(/,00$/, "") + " tr"
      ); // Replace dot with comma and remove trailing ,00
    } else if (num >= 1000) {
      // For numbers greater than or equal to 1 thousand
      return (
        (num / 1000).toFixed(2).replace(".", ",").replace(/,00$/, "") + " ng"
      ); // Replace dot with comma and remove trailing ,00
    }
    return num?.toString(); // Return the number as a string if it's less than 1000
  }

  const handleShareProfile = (userId) => {
    const customLink = `${window.location.origin}/user/${userId}`;
    navigator.clipboard
      .writeText(customLink)
      .then(() => {
        notificationApi(
          "success",
          "Sao chép thành công",
          "Đã sao chép đường dẫn hồ sơ cá nhân của bạn!"
        );
      })
      .catch((error) => {
        notificationApi(
          "error",
          "Sao chép không thành công",
          "Đã xảy ra lỗi khi sao chép link!"
        );
        console.error("Error copying link: ", error);
      });
  };

  return (
    <div className="mx-auto">
      {/* Cover Photo with Parallax Effect */}
      {userData && (
        <div className="relative">
          <div className="">
            {/* <motion.div
              style={{ overflow: "hidden" }} // Hides the overflowed part of the image
              animate={{ height: containerHeight }} // Dynamically change height on scroll
              transition={{ duration: 0.01, ease: "easeInOut" }} // Smooth transition
              className="w-full "
            > */}
            {/* Button positioned absolutely */}

            <img
              src={userData?.cover} // Use coverPhoto from userData
              alt="Cover"
              className="w-full h-screen  object-cover" // Image maintains its full width and natural height
            />
            {/* </motion.div> */}
          </div>

          <div className="flex justify-between w-full   absolute top-48 left-0 right-0 backdrop-blur bg-black/50 p-4 ">
            <div className="w-1/4"></div>
            <div className="w-1/2 flex flex-col items-center gap-2 text-[#e0e0e0] font-normal">
              <img
                src={userData?.avatar} // Use profilePicture from userData
                alt="Profile"
                className="w-32 h-32 rounded-full border-4 border-white shadow-lg"
              />
              <h1 className="text-2xl font-bold text-center">
                {userData?.name}
              </h1>
              <p className="text-center flex">
                {userData.location ? (
                  <>
                    <HiOutlineLocationMarker className="m-1" />
                    {userData?.location}
                  </>
                ) : (
                  ""
                )}
              </p>
              {currentUpgradedPackageName && (
                <div
                  onClick={() => navigate("/upgrade")}
                  className="hover:cursor-pointer text-[#202225] font-bold my-1 flex flex-col items-center justify-center px-4 py-2 bg-yellow-500 rounded-lg"
                >
                  <div>Nhiếp ảnh gia gói: {currentUpgradedPackageName}</div>
                  <div className="text-[14px] font-normal">
                    Ngày hết hạn: <span className="font-bold">{expiredAt}</span>
                  </div>
                  <div className="text-[14px] font-normal">
                    Còn lại:{" "}
                    <span className="font-bold">{remainingDays} ngày</span>
                  </div>
                </div>
              )}

              <p className="mt-2 text-center">
                {userData?.quote} {/* Use bio from userData */}
              </p>
              {userData.mail && (
                <a href={`mailto:${userData.mail}`}> {userData.mail}</a>
              )}
              {userData.phonenumber && <p> {userData.phonenumber}</p>}
              <div className="flex flex-col items-center gap-3 text-white rounded-xl px-10 py-4">
                <div className="flex gap-5">
                  <div className="flex items-center gap-1">
                    <div className="font-bold">
                      {formatNumber(userData?._count?.photos)}
                    </div>
                    <div>ảnh</div>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="font-bold">
                      {formatNumber(userData?._count?.followers)}
                    </div>
                    <div>người theo dõi</div>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="font-bold">
                      {formatNumber(userData?._count?.followings)}
                    </div>
                    <div>đang theo dõi</div>
                  </div>
                  <div
                    onClick={() => handleShareProfile(userData.id)}
                    className="flex items-center p-2 hover:bg-[#eee] hover:text-[#202225] transition duration-200 rounded-full hover:cursor-pointer"
                  >
                    <BiShareAlt className="text-2xl" />
                  </div>
                </div>
                {/* <div className="flex gap-10">
                  <FaFacebook className="w-6 h-6 hover:cursor-pointer" />
                  <FaInstagram className="w-6 h-6 hover:cursor-pointer" />
                  <CiGlobe className="w-6 h-6 hover:cursor-pointer" />
                </div> */}
              </div>
            </div>

            <div className="w-1/4 flex justify-end mt-16 p-3 text-[#e0e0e0]">
              <Tooltip title="Update Profile">
                <div
                  className=" hover:text-white font-normal h-fit flex flex-row cursor-pointer rounded-lg p-2"
                  onClick={openModal}
                >
                  <div className="m-1">
                    <IoPencil />
                  </div>
                  <p>Cập nhật hồ sơ</p>
                </div>
              </Tooltip>
            </div>
          </div>
          <UpdateProfileModal userData={userData} />

          {/* <ProfileLayout /> */}
        </div>
      )}

      {isLoading && (
        <div>
          <LoadingProfile />{" "}
        </div>
      )}
    </div>
  );
};

export default UserProfile;

import React from "react";
import calculateDateDifference from "../../utils/calculateDateDifference";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import PhotoApi from "../../apis/PhotoApi";

// REFERENCE TYPE:
// "PHOTOGRAPHER_BOOKING_NEW_REQUEST"
// "PHOTOGRAPHER_NEW_BOOKING_REVIEW"
// "UPGRADE_PACKAGE"
export default function PhotoNotification({ notification, onClose }) {
  const navigate = useNavigate();
  const photoId = notification.payload.id;
  const {
    data: photoDetail,
    isPending,
    error,
    isError,
    isLoading,
  } = useQuery({
    queryKey: ["photo-detail-nofi", photoId],
    queryFn: () => PhotoApi.getPhotoById(photoId),
  });
  const referenceType =
    photoDetail && photoDetail?.photoSellings[0]?.active
      ? "PHOTO_SELL_COMMENT"
      : notification.referenceType;
  // console.log(
  //   "photoDetail",
  //   photoDetail && photoDetail.photoSellings[0].active
  // );
  const handleNavigate = (referenceType) => {
    switch (referenceType) {
      case "PHOTO_BAN":
      case "PHOTO_UNBAN":
      case "DUPLICATED_PHOTO":
        navigate("/profile/my-photos");
        break;
      case "PHOTO_COMMENT":
        navigate("/photo/" + photoId);
        break;
      case "PHOTO_SELL_COMMENT":
        navigate("/explore/product-photo/" + photoId);
        break;
      default:
        break;
    }
  };
  if (error) {
    return "";
  }
  return (
    <div
      className="border-b border-gray-500 px-1 py-2  hover:cursor-pointer hover:bg-gray-500 transition-colors duration-200"
      key={notification.id}
      onClick={() => {
        handleNavigate(referenceType);
        onClose();
      }}
    >
      <div className="flex items-center gap-2 p-2 rounded-sm">
        <div className="w-[35px] h-[35px] overflow-hidden rounded-full">
          <img
            src={
              photoDetail?.signedUrl?.thumbnail ||
              "https://vnn-imgs-a1.vgcloud.vn/image1.ictnews.vn/_Files/2020/03/17/trend-avatar-1.jpg"
            }
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
        <div
          className={`w-[225px] lg:w-[335px] text-sm lg:text-base ${
            notification.referenceType === "PHOTO_BAN" && "text-red-500"
          }`}
        >
          {notification.content}
        </div>
      </div>
      <div className="text-right text-sm text-gray-400">
        {calculateDateDifference(notification.updatedAt)}
      </div>
    </div>
  );
}

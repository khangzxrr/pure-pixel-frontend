import React from "react";
import calculateDateDifference from "../../utils/calculateDateDifference";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import PhotoExchange from "../../apis/PhotoExchange";

// REFERENCE TYPE:
// "PHOTOGRAPHER_PHOTO_SELL"
// "PHOTO_NEW_PRICE_UPDATED"
// "CUSTOMER_PHOTO_BUY"
export default function PhotoExchangeNotification({ notification, onClose }) {
  const navigate = useNavigate();
  const photoId = notification.payload.id;
  const {
    data: photoDetail,
    isPending,
    error,
    isError,
    isLoading,
  } = useQuery({
    queryKey: ["photo-exchange-detail-nofi", photoId],
    queryFn: () => PhotoExchange.getPhotoBoughtDetail(photoId),
  });
  const referenceUrl =
    notification.referenceType === "CUSTOMER_PHOTO_BUY"
      ? photoDetail?.photoBuys[0]?.previewUrl
      : photoDetail?.photo?.signedUrl?.thumbnail;

  const handleNavigate = (referenceType) => {
    switch (referenceType) {
      case "PHOTOGRAPHER_PHOTO_SELL":
      case "PHOTO_NEW_PRICE_UPDATED":
        navigate("/profile/wallet");
        break;
      case "CUSTOMER_PHOTO_BUY":
        navigate("/profile/photo-bought/" + photoId);
        break;
      default:
        break;
    }
  };
  if (isError) {
    return "";
  }
  return (
    <div
      className="border-b border-gray-500 px-1 py-2  hover:cursor-pointer hover:bg-gray-500 transition-colors duration-200"
      key={notification.id}
      onClick={() => {
        handleNavigate(notification.referenceType);
        onClose();
      }}
    >
      <div className="flex items-center gap-2 p-2 rounded-sm">
        <div className="w-[35px] h-[35px] overflow-hidden rounded-full">
          <img
            src={
              referenceUrl ||
              "https://vnn-imgs-a1.vgcloud.vn/image1.ictnews.vn/_Files/2020/03/17/trend-avatar-1.jpg"
            }
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
        <div className={`w-[225px] lg:w-[335px] text-sm lg:text-base`}>
          {notification.content}
        </div>
      </div>
      <div className="text-right text-sm text-gray-400">
        {calculateDateDifference(notification.updatedAt)}
      </div>
    </div>
  );
}

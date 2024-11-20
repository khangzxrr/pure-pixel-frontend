import React, { useState } from "react";
import useBookingPhotoStore from "../../../states/UseBookingPhotoStore";
import { Checkbox, Progress, Tooltip } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { PhotographerBookingApi } from "../../../apis/PhotographerBookingApi";
import { useParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { notificationApi } from "../../../Notification/Notification";
import debounce from "lodash.debounce";

export default function BookingPhotoList({ enableUpdate }) {
  const { bookingId } = useParams();
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    photoArray,
    setSelectedPhotoByUid,
    selectedPhoto,
    removePhotoById,
    removePhotoByUid,
  } = useBookingPhotoStore();

  const deletePhoto = useMutation({
    mutationFn: ({ bookingId, photoId }) =>
      PhotographerBookingApi.deleteBookingPhoto(bookingId, photoId),
  });

  const handleSelect = (photo) => {
    setSelectedPhotoByUid(photo.uid);
  };

  const handleRemove = debounce(async (photo) => {
    if (isDeleting) return;
    setIsDeleting(true);

    if (photo.id) {
      try {
        const photoId = photo.id;
        await deletePhoto.mutateAsync(
          { photoId: photoId, bookingId: bookingId },
          {
            onSuccess: () => {
              removePhotoById(photoId);
            },
            onError: (error) => {
              notificationApi(
                "error",
                "Xóa ảnh không thành công",
                "Ảnh xóa không thành công, vui lòng thử lại",
                "",
                0,
                "delele-booking-photo-error"
              );
            },
          }
        );
      } catch (error) {
        notificationApi(
          "error",
          "Xóa ảnh không thành công",
          "Ảnh xóa không thành công, vui lòng thử lại",
          "",
          0,
          "delele-booking-photo-error"
        );
      } finally {
        setIsDeleting(false);
      }
    } else {
      removePhotoByUid(photo.uid);
      setIsDeleting(false);
    }
  }, 300); // Adjust the debounce delay as needed

  return (
    <div className="flex overflow-x-scroll custom-scrollbar w-full">
      {photoArray.toReversed().map((photo, index) => (
        <div key={index} className="relative p-2 flex-shrink-0">
          <img
            src={photo?.reviewUrl}
            className={`w-[150px] h-[150px] object-cover rounded-md cursor-pointer ${
              photo.uid === selectedPhoto
                ? "border-4 border-white transition duration-300"
                : ""
            }`}
            alt="Ban Thao"
            onClick={() => handleSelect(photo)}
          />
          {photo.status !== "done" && (
            <div
              className={`absolute inset-0 m-1 z-10 grid place-items-center rounded-lg cursor-pointer ${
                photo.uid === selectedPhoto
                  ? "bg-gray-300 opacity-80 hover:opacity-70"
                  : "bg-gray-500 opacity-70 hover:opacity-80"
              }`}
              onClick={() => handleSelect(photo)}
            >
              <Progress type="circle" percent={photo.percent} size={60} />
              <p className="text-blue-500">
                {photo.percent < 70 ? "Đang tải ảnh lên" : "Đang xử lý ảnh"}
              </p>
            </div>
          )}

          {enableUpdate && (
            <div className="h-8 w-8 absolute top-2 right-2 grid place-items-center z-20 bg-red-300 bg-opacity-30 backdrop-blur-md rounded-full">
              <Tooltip title="Xóa ảnh này" color="red">
                <DeleteOutlined
                  className="text-white text-xl cursor-pointer hover:text-red-500"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent triggering the parent onClick
                    handleRemove(photo);
                  }}
                />
              </Tooltip>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

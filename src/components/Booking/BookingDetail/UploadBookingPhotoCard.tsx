import { useState } from "react";
import useBookingPhotoStore, {
  type BookingPhotoItem,
} from "../../../states/UseBookingPhotoStore";
import { Progress, Tooltip } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { PhotographerBookingApi } from "../../../apis/PhotographerBookingApi";
import { useParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { notificationApi } from "../../../Notification/Notification";

type UploadBookingPhotoCardProps = {
  photo: BookingPhotoItem;
  index: number;
  isAbleDelete: boolean;
  // passed by BookingDetailUpload but not used here
  enableUpdate?: boolean;
};

export default function UploadBookingPhotoCard({
  photo,
  index,
  isAbleDelete,
}: UploadBookingPhotoCardProps) {
  // the route always provides the id
  const { bookingId = "" } = useParams();
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    setSelectedPhotoByUid,
    selectedPhoto,
    removePhotoById,
    removePhotoByUid,
  } = useBookingPhotoStore();

  const deletePhoto = useMutation({
    mutationFn: ({ bookingId, photoId }: { bookingId: string; photoId: string }) =>
      PhotographerBookingApi.deleteBookingPhoto(bookingId, photoId),
  });

  const handleSelect = (photo: BookingPhotoItem) => {
    setSelectedPhotoByUid(photo.uid);
  };

  const handleRemove = async (photo: BookingPhotoItem) => {
    if (isDeleting) return;
    if (photo.id) {
      try {
        removePhotoById(photo.id);
        setIsDeleting(true);
        await deletePhoto.mutateAsync(
          { photoId: photo.id, bookingId: bookingId },
          {
            onSuccess: () => {
              setIsDeleting(false);
            },
            onError: () => {
              notificationApi?.(
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
      } catch {
        notificationApi?.(
          "error",
          "Xóa ảnh không thành công",
          "Ảnh xóa không thành công, vui lòng thử lại",
          "",
          0,
          "delele-booking-photo-error"
        );
      }
    } else {
      removePhotoByUid(photo.uid);
    }
  }; // Adjust the debounce delay as needed

  return (
    <div key={index} className="relative p-2 ">
      <img
        src={photo?.thumbnailUrl}
        className={`w-[150px] lg:w-[170px] h-[150px] lg:h-[170px] object-cover rounded-md cursor-pointer ${
          photo.uid === selectedPhoto
            ? "border-4 border-gray-300 transition duration-300"
            : ""
        }`}
        alt="Bản Thảo"
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
            {/* Number() keeps a missing percent comparing false, as before */}
            {Number(photo.percent) < 70 ? "Đang tải ảnh lên" : "Đang xử lý ảnh"}
          </p>
        </div>
      )}

      {isAbleDelete && photo.status === "done" && (
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
  );
}

import { Checkbox, message, Progress, Tooltip } from "antd";
import useUploadPhotoStore from "../../../states/UploadPhotoState";
import { DeleteOutlined } from "@ant-design/icons";
import PhotoApi from "../../../apis/PhotoApi";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useNotification } from "../../../Notification/Notification";
import "./UploadPhoto.css";
export default function PhotoCard({ photo }) {
  const {
    setSelectedPhotoByUid,
    removePhotoByUid,
    removePhotoById,
    updatePhotoPropertyByUid,
    selectedPhoto,
  } = useUploadPhotoStore();
  const { notificationApi } = useNotification();

  const deletePhoto = useMutation({
    mutationFn: ({ id }) => PhotoApi.deletePhoto(id),
  });

  const handleRemove = (photo) => {
    if (photo.response) {
      console.log("deletephoto", photo);

      try {
        deletePhoto.mutateAsync(
          { id: photo.response.id },
          {
            onSuccess: () => {
              removePhotoById(photo.response.id);
            },
            onError: (error) => {
              message.error("Chưa thể xóa ảnh");
            },
          }
        );
      } catch (error) {
        message.error("Chưa thể xóa ảnh");
      }
    } else {
      removePhotoByUid(photo.file.uid);
    }
  };

  const handleSelect = () => {
    setSelectedPhotoByUid(photo.file.uid);
  };

  return (
    <div className="relative grid grid-rows-2 p-2">
      <div className="lg:w-[200px] lg:h-[150px] w-[180px] h-[135px]">
        <img
          src={photo?.reviewUrl}
          className={`w-full h-full object-cover rounded-md cursor-pointer ${
            photo.file.uid === selectedPhoto
              ? "border-4 border-white transition duration-300"
              : ""
          }`}
          alt="Photo"
          onClick={handleSelect}
        />
        <div className="flex justify-between">
          <p className="text-slate-300 pr-4 font-semibold text-center overflow-hidden whitespace-nowrap text-ellipsis">
            {photo.title}
          </p>
          <div className=" bottom-3 right-3 z-20">
            <Tooltip
              placement="topRight"
              color="geekblue"
              title={photo.watermark ? "Gỡ nhãn" : "Gắn nhãn"}
            >
              <Checkbox
                onChange={(e) => {
                  updatePhotoPropertyByUid(
                    photo.file.uid,
                    "watermark",
                    e.target.checked
                  );
                }}
                checked={photo.watermark}
              />
            </Tooltip>
          </div>
        </div>
      </div>
      {photo.status !== "done" && (
        <div
          className={`absolute inset-0 grid place-items-center ${
            photo.file.uid === selectedPhoto
              ? "bg-gray-300 opacity-80 hover:opacity-70"
              : "bg-gray-500 opacity-70 hover:opacity-80"
          } z-10 rounded-lg`}
          onClick={handleSelect}
        >
          <Progress type="circle" percent={photo.percent} size={60} />
          <p className="text-blue-500">
            {photo.percent < 70 ? "Đang tải ảnh lên" : "Đang xử lý ảnh"}
          </p>
        </div>
      )}

      <div className="absolute top-3 right-3 flex items-center z-10 p-2  rounded-xl hover:bg-opacity-80 bg-opacity-30 bg-gray-200">
        <Tooltip title="Xóa ảnh">
          <DeleteOutlined
            className="text-white text-xl hover:text-red-500 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              handleRemove(photo);
            }}
          />
        </Tooltip>
      </div>
    </div>
  );
}

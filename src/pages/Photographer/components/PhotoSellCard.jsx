import { message, Progress, Tooltip } from "antd";
import { DeleteOutlined, UndoOutlined } from "@ant-design/icons";
import PhotoApi from "../../../apis/PhotoApi";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useNotification } from "../../../Notification/Notification";
// import "./UploadPhoto.css";
import useSellPhotoStore from "../../../states/UseSellPhotoState";

export default function PhotoSellCard({ photo }) {
  const {
    setSelectedPhotoByUid,
    removePhotoByUid,
    removePhotoById,
    updatePhotoPropertyByUid,
    selectedPhoto,
    setPhotoUploadResponse,
    addPhoto,
  } = useSellPhotoStore();
  const { notificationApi } = useNotification();
  //handle exception from api response

  const isInValidPhotoTagsPhoto =
    photo &&
    photo.status === "done" &&
    !photo?.pricetags?.some((tag) => tag.price >= 1000);

  const deletePhoto = useMutation({
    mutationFn: ({ id }) => PhotoApi.deletePhoto(id),
  });
  const { mutateAsync: deletePhotoMutate, isPending: isPendingDeletePhoto } =
    deletePhoto;
  const handleRemove = async (photo) => {
    console.log("photo", isPendingDeletePhoto, photo);
    const photoId = photo.response?.id;
    if (isPendingDeletePhoto) return;
    if (photoId && photo.status !== "error") {
      console.log("deletephoto", photo);
      removePhotoById(photo.response.id);

      try {
        await deletePhotoMutate(
          { id: photo.response.id },
          {
            // onSuccess: () => {
            //   setIsDeleting(false);
            // },
            onError: (error) => {
              console.log("deletePhotoMutateError", error);
              message.error("Chưa thể xóa ảnh");
            },
          }
        );
      } catch (error) {
        addPhoto(photo.file.uid, {
          ...photo,
          status: "done",
        });
        message.error("Chưa thể xóa ảnh");
      }
    } else {
      removePhotoByUid(photo.file.uid);
    }
  };

  const handleSelect = () => {
    setSelectedPhotoByUid(photo.file.uid);
  };
  const uploadPhoto = useMutation({
    mutationFn: ({ file, onUploadProgress }) =>
      PhotoApi.uploadPhoto(file, onUploadProgress),
  });
  const {
    mutateAsync: tryUploadPhotoMutate,
    isPending: tryUploadPhotoPending,
  } = uploadPhoto; // Destructure the return value of the hook
  const getAvailableResolutionsByPhotoId = useMutation({
    mutationFn: async (photoId) =>
      await PhotoApi.getAvailableResolutionsByPhotoId(photoId),
  });
  const tryUploadPhoto = async ({ file, onError, onSuccess }) => {
    console.log("tryUploadPhoto", file);
    try {
      const response = await tryUploadPhotoMutate({
        file,
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded / progressEvent.total) * 90
          );

          updatePhotoPropertyByUid(photo.file.uid, "percent", percentCompleted);
        },
      });
      console.log("response", response);
      setPhotoUploadResponse(photo.file.uid, response);
      updatePhotoPropertyByUid(photo.file.uid, "status", "done");
      updatePhotoPropertyByUid(photo.file.uid, "percent", 100);
      try {
        const photoResolution =
          await getAvailableResolutionsByPhotoId.mutateAsync(response.id);
        console.log("photoResolution", photoResolution);
        updatePhotoPropertyByUid(file.uid, "pricetags", photoResolution);
        setSelectedPhotoByUid(file.uid);
        onSuccess(response);
      } catch (error) {
        onError(e);
      }
    } catch (e) {
      console.log("tryUploadPhoto error", e);
    }
  };
  const reUploadPhoto = () => {
    console.log("file", photo.file);
    tryUploadPhoto({ file: photo.file });
  };

  return (
    <div className="relative p-2">
      <div className="lg:w-[200px] lg:h-[150px] w-[180px] h-[135px]">
        <img
          src={photo?.reviewUrl}
          className={`w-full h-full object-cover rounded-md cursor-pointer ${
            photo.file.uid === selectedPhoto && photo.status === "done"
              ? "border-4 border-white transition duration-200"
              : photo.file.uid === selectedPhoto && photo.status !== "done"
              ? "border-4 border-red-500 transition duration-200"
              : ""
          }`}
          alt="Photo"
          onClick={handleSelect}
        />
        <div className="flex justify-between">
          <p className="text-slate-300 pr-4 font-semibold text-center overflow-hidden whitespace-nowrap text-ellipsis">
            {photo.title}
          </p>
        </div>
      </div>

      {photo.status === "uploading" && (
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

      {photo.status !== "uploading" && photo.status !== "done" && (
        <div
          className={`absolute m-2 inset-0 grid place-items-center bg-red-300 bg-opacity-50 z-10 rounded-md cursor-pointer`}
          onClick={handleSelect}
        >
          {tryUploadPhotoPending ? (
            "loading.."
          ) : (
            <div className="flex flex-col items-center cursor-pointer text-white font-normal text-center hover:opacity-80">
              <p className="p-3 mx-1 bg-gray-500 bg-opacity-55">
                {photo.status === "duplicated"
                  ? "Ảnh đã tồn tại trong hệ thống"
                  : photo.status}
              </p>
            </div>
          )}
        </div>
      )}

      <div className="absolute top-3 right-3 flex items-center z-10 p-2 rounded-xl hover:bg-opacity-80 bg-opacity-30 bg-gray-200">
        <Tooltip title="Xóa ảnh">
          <DeleteOutlined
            className="text-white text-xl hover:text-red-500 cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleRemove(photo);
            }}
          />
        </Tooltip>
      </div>

      {isInValidPhotoTagsPhoto && (
        <div
          className={`absolute m-2 inset-0 grid place-items-center bg-opacity-50 rounded-md cursor-pointer`}
          onClick={handleSelect}
        >
          <div className="flex flex-col items-center justify-end w-full h-full ">
            <p
              className={`text-white text-center p-1 w-full bg-yellow-600 bg-opacity-80 rounded-b-md   ${
                photo.file.uid === selectedPhoto &&
                photo.status === "done" &&
                "border-x-4 border-b-4 border-white transition duration-200"
              }`}
            >
              Ảnh chưa có giá bán
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

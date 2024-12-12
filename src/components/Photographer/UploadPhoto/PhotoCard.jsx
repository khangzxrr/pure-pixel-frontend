import { Checkbox, message, Progress, Tooltip } from "antd";
import useUploadPhotoStore from "../../../states/UploadPhotoState";
import {
  DeleteOutlined,
  LoadingOutlined,
  RedoOutlined,
  UndoOutlined,
} from "@ant-design/icons";
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
    setPhotoUploadResponse,
    addPhoto,
  } = useUploadPhotoStore();
  const { notificationApi } = useNotification();
  //handle exception from api response

  const [isDeleting, setIsDeleting] = useState(false);
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
  const handleException = (errorMessage) => {
    switch (errorMessage) {
      case "RunOutPhotoQuotaException":
        notificationApi(
          "error",
          "Tải ảnh lên thất bại",
          "Bạn đã tải lên vượt quá dung lượng của gói nâng cấp, vui lòng nâng cấp thêm để tăng dung lượng lưu trữ",
          "",
          0,
          "upload-photo-dragger-error"
        );
        updatePhotoPropertyByUid(photo.file.uid, "status", "outQuota");

        break;

      case "FailToPerformOnDuplicatedPhotoException":
        notificationApi(
          "error",
          "Tải ảnh lên thất bại",
          "Ảnh bạn tải lên đã tồn tại trong hệ thống, vui lòng kiểm tra lại",
          "",
          0,
          "upload-photo-dragger-error"
        );
        updatePhotoPropertyByUid(photo.file.uid, "status", "duplicated");

        break;

      case "FileIsNotValidException":
        notificationApi(
          "error",
          "Tải ảnh lên thất bại",
          "Tệp tải lên không hợp lệ, vui lòng chọn tệp hình ảnh hợp lệ",
          "",
          0,
          "upload-photo-dragger-error"
        );
        updatePhotoPropertyByUid(photo.file.uid, "status", "invalid");

        break;

      case "ExifNotFoundException":
        notificationApi(
          "error",
          "Tải ảnh lên thất bại",
          "Không tìm thấy dữ liệu EXIF trong ảnh, vui lòng chọn ảnh có dữ liệu EXIF",
          "",
          0,
          "upload-photo-dragger-error"
        );
        updatePhotoPropertyByUid(photo.file.uid, "status", "invalid");

        break;

      case "MissingMakeExifException":
        notificationApi(
          "error",
          "Tải ảnh lên thất bại",
          "Dữ liệu EXIF thiếu thông tin nhà sản xuất (Make), vui lòng kiểm tra lại",
          "",
          0,
          "upload-photo-dragger-error"
        );
        updatePhotoPropertyByUid(photo.file.uid, "status", "invalid");

        break;

      case "MissingModelExifException":
        notificationApi(
          "error",
          "Tải ảnh lên thất bại",
          "Dữ liệu EXIF thiếu thông tin mẫu máy (Model), vui lòng kiểm tra lại",
          "",
          0,
          "upload-photo-dragger-error"
        );
        updatePhotoPropertyByUid(photo.file.uid, "status", "invalid");

        break;

      case "UploadPhotoFailedException":
        notificationApi(
          "error",
          "Tải ảnh lên thất bại",
          "Đã xảy ra lỗi khi tải ảnh lên, vui lòng thử lại",
          "",
          0,
          "upload-photo-dragger-error"
        );
        updatePhotoPropertyByUid(photo.file.uid, "status", "failed");

        break;

      default:
        notificationApi(
          "error",
          "Lỗi không xác định",
          "Đã xảy ra lỗi không xác định, vui lòng thử lại",
          "",
          0,
          "upload-photo-dragger-error"
        );
        updatePhotoPropertyByUid(photo.file.uid, "status", "failed");

        break;
    }
  };
  const timeout = (promise, ms) => {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error("Request timed out"));
      }, ms);

      promise
        .then((response) => {
          clearTimeout(timer);
          resolve(response);
        })
        .catch((err) => {
          clearTimeout(timer);
          reject(err);
        });
    });
  };
  const uploadPhoto = useMutation({
    mutationFn: ({ file, onUploadProgress }) => {
      console.log("uploadPhoto", file);
      return timeout(
        PhotoApi.uploadPhoto(file, onUploadProgress),
        3000 // 5-minute timeout
      );
    },
    onError: (e) => {
      console.log("uploadPhoto error", e.response);
      // handleException(photo.file, e);
    },
  });
  const {
    mutateAsync: tryUploadPhotoMutate,
    isPending: tryUploadPhotoPending,
  } = uploadPhoto; // Destructure the return value of the hook
  const tryUploadPhoto = async ({ file }) => {
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
    } catch (e) {
      handleException(e?.response?.data?.message);
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
          <p className="text-slate-300 pr-4   font-semibold text-center overflow-hidden whitespace-nowrap text-ellipsis">
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
      {photo.status !== "duplicated" ||
        (photo.status !== "invalid" && (
          <div
            className={`absolute m-2 inset-0 grid place-items-center bg-red-300 bg-opacity-50 z-10 rounded-md cursor-pointer`}
            onClick={handleSelect}
          >
            <div className="flex flex-col items-center cursor-pointer text-white font-normal text-center hover:opacity-80">
              {/* <UndoOutlined className="text-4xl text-blue-500" /> */}
              <p className="p-3">
                {photo.status === "duplicated"
                  ? "Ảnh đã tồn tại trong hệ thống"
                  : photo.status === "invalid"
                  ? "Ảnh không hợp lệ"
                  : photo.status}
              </p>
            </div>
          </div>
        ))}
      {photo.status === "outQuota" ||
        (photo.status === "failed" && (
          <div
            className={`absolute m-2 inset-0 grid place-items-center bg-red-300 bg-opacity-50 z-10 rounded-md cursor-pointer`}
            onClick={handleSelect}
          >
            {tryUploadPhotoPending ? (
              <LoadingOutlined
                style={{
                  fontSize: 33,
                }}
              />
            ) : (
              <Tooltip
                title="Thử lại"
                color="blue"
                onClick={(e) => {
                  e.preventDefault(); // Prevent default behavior (if applicable)
                  e.stopPropagation(); // Prevent event from propagating to parent elements
                  reUploadPhoto();
                }}
              >
                <div className="flex flex-col items-center cursor-pointer text-white font-normal text-center hover:opacity-80">
                  {/* <UndoOutlined className="text-4xl text-blue-500" /> */}
                  <p className="p-3  text-sm">
                    {photo.status === "outQuota"
                      ? "Dung lượng ảnh vượt quá giới hạn"
                      : photo.status === "failed"
                      ? "Tải ảnh lên thất bại"
                      : ""}
                  </p>
                  <div className="flex flex-col ">
                    <p>Thử lại</p>
                    <RedoOutlined
                      className="flex justify-center item-center mx-auto"
                      style={{
                        fontSize: 24,
                      }}
                    />
                  </div>
                </div>
              </Tooltip>
            )}
          </div>
        ))}

      {photo.watermark && (
        <div
          className={`absolute inset-0 grid place-items-center z-10 rounded-lg`}
          onClick={handleSelect}
        >
          <p className="text-gray-700 text-xl">PXL</p>
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

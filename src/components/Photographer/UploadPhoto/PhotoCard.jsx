import { Checkbox, message, Progress, Tooltip } from "antd";
import useUploadPhotoStore from "../../../states/UploadPhotoState";
import { DeleteOutlined, UndoOutlined } from "@ant-design/icons";
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
  } = useUploadPhotoStore();
  const { notificationApi } = useNotification();
  //handle exception from api response

  const [isDeleting, setIsDeleting] = useState(false);
  const deletePhoto = useMutation({
    mutationFn: ({ id }) => PhotoApi.deletePhoto(id),
  });

  const handleRemove = async (photo) => {
    if (isDeleting) return;
    if (photo.response) {
      console.log("deletephoto", photo);
      setIsDeleting(true);
      removePhotoById(photo.response.id);

      try {
        await deletePhoto.mutateAsync(
          { id: photo.response.id },
          {
            onSuccess: () => {
              setIsDeleting(false);
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
      // setPhotoUploadResponse(photo.file.uid, response);
      // updatePhotoPropertyByUid(photo.file.uid, "status", "done");
      // updatePhotoPropertyByUid(photo.file.uid, "percent", 100);
    } catch (e) {
      console.log("tryUploadPhoto error", e);
    }
  };
  const reUploadPhoto = () => {
    console.log("file", photo.file);
    tryUploadPhoto({ file: photo.file });
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
      {photo.status === "error" && (
        <div
          className={`absolute inset-0 grid place-items-center bg-gray-300 bg-opacity-80  z-10 rounded-lg`}
        >
          {tryUploadPhotoPending ? (
            "loading.."
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
              <div className="flex flex-col items-center cursor-pointer text-blue-500 hover:opacity-80">
                <UndoOutlined className="text-4xl text-blue-500" />
                <p className="text-blue-500 mt-2">Thử lại</p>
              </div>
            </Tooltip>
          )}
        </div>
      )}
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

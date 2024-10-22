import { Checkbox, message, Progress, Spin, Tooltip } from "antd";
import useUploadPhotoStore from "../../../states/UploadPhotoState";
import { DeleteOutlined } from "@ant-design/icons"; // Ensure you have this import
import PhotoApi from "../../../apis/PhotoApi";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useNotification } from "../../../Notification/Notification";
import { SmileOutlined } from "@ant-design/icons";

function truncateString(str, num) {
  if (str.length <= num) {
    return str;
  }
  return str.slice(0, num) + "...";
}
const getAspectRatio = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = url;
    img.onload = () => {
      const aspectRatio = img.width / img.height;
      resolve(aspectRatio);
    };
    img.onerror = (error) => {
      reject(error);
    };
  });
};
export default function PhotoCard({ photo }) {
  const {
    setSelectedPhotoByUid,
    getPhotoByUid,
    removePhotoByUid,
    removePhotoById,
    updatePhotoPropertyByUid,
    selectedPhoto,
  } = useUploadPhotoStore();
  const { notificationApi } = useNotification();
  const [displayTitle, setDisplayTitle] = useState("Untitled");

  // const photoData = getPhotoByUid(photo.file.uid);

  const deletePhoto = useMutation({
    mutationFn: ({ id }) => PhotoApi.deletePhoto(id),
  });

  const handleRemove = (photo) => {
    if (photo.signedUpload.photoId) {
      try {
        deletePhoto.mutateAsync(
          { id: photo.signedUpload.photoId },
          {
            onSuccess: () => {
              notificationApi(
                "success",
                "Xóa ảnh thành công",
                "Bạn đã xóa ảnh thành công",
                "",
                0,
                "delete-photo"
              );
              removePhotoById(photo.signedUpload.photoId);
              // Additional logic to handle the successful deletion of the photo
            },
            onError: (error) => {
              console.log("Error deleting photo", error);

              message.error("Chưa thể xóa ảnh"); // Additional logic to handle the successful deletion of the photo
              // Additional logic to handle the error
            },
          }
        );
      } catch (error) {
        console.log("Error deleting photo", error);
        message.error("Chưa thể xóa ảnh");
      }
    } else {
      removePhotoByUid(photo.file.uid);
    }
  };
  const handleSelect = () => {
    setSelectedPhotoByUid(photo.file.uid);
  };

  useEffect(() => {
    const fetchAspectRatio = async () => {
      if (photo?.reviewUrl) {
        try {
          const ratio = await getAspectRatio(photo.reviewUrl);
          if (ratio < 1) {
            setDisplayTitle(truncateString(photo.title, 10));
          } else {
            setDisplayTitle(truncateString(photo.title, 20));
          }
        } catch (error) {
          console.error("Error loading image:", error);
        }
      }
    };

    fetchAspectRatio();
  }, [photo]);

  return (
    <div className="relative h-56 flex-shrink-0 p-2">
      <img
        src={photo?.reviewUrl}
        className={`h-3/4 w-full object-cover rounded-md cursor-pointer ${
          photo.file.uid === selectedPhoto
            ? "border-4 border-white transition duration-300"
            : ""
        }`}
        alt="Ban Thao"
        onClick={() => handleSelect(photo)}
      />
      <p className="text-slate-300 font-semibold text-center overflow-hidden">
        {displayTitle}
      </p>
      {photo.status !== "parsed" && (
        <div
          className={`absolute m-1 h-48 inset-0   ${
            photo.file.uid === selectedPhoto
              ? " bg-gray-300 opacity-80 hover:opacity-70 "
              : " bg-gray-500 opacity-70 hover:opacity-80 "
          } z-10 flex flex-col items-center justify-center rounded-lg cursor-pointer `}
          onClick={() => handleSelect(photo)}
        >
          <Progress type="circle" percent={photo.percent} size={60} />
          <p className="text-blue-500">
            {photo.percent < 70 ? "Đang tải ảnh lên" : "Đang xử lý ảnh"}
          </p>
        </div>
      )}

      <>
        <div className="h-8 w-8 absolute top-2 right-2 flex justify-center items-center z-20 bg-red-300 bg-opacity-30 backdrop-blur-md   rounded-full">
          <Tooltip title="Delete Photo">
            <DeleteOutlined
              className="text-white text-xl cursor-pointer hover:text-red-500"
              onClick={(e) => {
                e.stopPropagation(); // Prevent triggering the parent onClick
                handleRemove(photo);
              }}
            />
          </Tooltip>
        </div>

        <div className="h-4 w-4  absolute bottom-16 right-3 flex justify-center items-center z-20">
          <div className="absolute">
            <Tooltip
              placement="topRight"
              color="geekblue"
              title={photo.watermark ? "Gỡ nhãn" : "Gắn nhãn"}
            >
              <Checkbox
                onChange={(e) => {
                  console.log("Checkbox onChange", e.target.checked);
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
      </>
    </div>
  );
}

import { Checkbox, message, Spin, Tooltip } from "antd";
import useUploadPhotoStore from "../../../states/UploadPhotoState";
import { DeleteOutlined } from "@ant-design/icons"; // Ensure you have this import
import PhotoApi from "../../../apis/PhotoApi";
import { useMutation } from "@tanstack/react-query";

function truncateString(str, num) {
  if (str.length <= num) {
    return str;
  }
  return str.slice(0, num) + "...";
}

export default function PhotoCard({ photo }) {
  const {
    setSelectedPhoto,
    removePhotoByUid,
    selectedPhoto,
    updateFieldByUid,
  } = useUploadPhotoStore();
  const displayTitle = photo?.name
    ? truncateString(photo.name, 13)
    : "Untitled"; // Adjust the number as needed

  const deletePhoto = useMutation({
    mutationFn: ({ id }) => PhotoApi.deletePhoto(id),
  });

  const handleRemove = (photo) => {
    console.log("onRemove", photo);
    if (photo.photoId) {
      try {
        deletePhoto.mutateAsync(
          { id: photo.photoId },
          {
            onSuccess: () => {
              message.success("Xóa ảnh thành công");
              removePhotoByUid(photo.uid);
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
      removePhotoByUid(photo.uid);
    }
  };
  const handleSelect = () => {
    setSelectedPhoto(photo.uid);
  };
  return (
    <div className="relative h-56 flex-shrink-0 p-2">
      <img
        src={photo?.reviewUrl}
        className={`h-3/4 w-full object-cover rounded-md cursor-pointer ${
          photo.uid === selectedPhoto?.uid
            ? "border-4 border-white transition duration-300"
            : ""
        }`}
        alt="Ban Thao"
        onClick={() => handleSelect(photo)}
      />
      <p className="text-slate-300 font-semibold text-center overflow-hidden">
        {displayTitle}
      </p>
      <>
        <div className="h-8 w-8 absolute top-2 right-2 flex justify-center items-center z-20 bg-red-300 bg-opacity-30 backdrop-blur-md rounded-full">
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
                  updateFieldByUid(photo.uid, "watermark", e.target.checked);
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

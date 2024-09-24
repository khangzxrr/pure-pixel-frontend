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
  const { setSelectedPhoto, removePhotoByUid, selectedPhoto, updateField } =
    useUploadPhotoStore();
  const displayTitle = photo?.name
    ? truncateString(photo.name, 13)
    : "Untitled"; // Adjust the number as needed

  const deletePhoto = useMutation({
    mutationFn: ({ id }) => PhotoApi.deletePhoto(id),
  });

  const handleRemove = (photo) => {
    console.log("onRemove", photo);
    deletePhoto.mutateAsync(
      { id: photo.id },
      {
        onSuccess: () => {
          message.success("Xóa ảnh thành công");
          removePhotoByUid(photo.uid);
          // Additional logic to handle the successful deletion of the photo
        },
        onError: (error) => {
          message.error("Chưa thể xóa ảnh"); // Additional logic to handle the successful deletion of the photo
          // Additional logic to handle the error
        },
      }
    );
  };
  const handleSelect = () => {
    if (photo.status === "PARSED") {
      setSelectedPhoto({
        ...photo,
        title: photo.name.replace(/\.(png|jpg)$/i, ""),
      });
    } else {
      message.loading("File is not ready yet.");
    }
  };
  return (
    <div className="relative h-64 flex-shrink-0 p-2">
      <img
        src={photo?.upload_url}
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
      {photo.status === "PARSED" && (
        <>
          <div className="h-4 w-4 absolute top-4 right-4 flex justify-center items-center z-20">
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
          <div className="h-4 w-4  absolute bottom-20 right-4 flex justify-center items-center z-20">
            <div className="absolute">
              <Tooltip
                placement="topRight"
                color="geekblue"
                title={photo.isWatermark ? "Gỡ nhãn" : "Gắn nhãn"}
              >
                <Checkbox
                  onChange={(e) => {
                    console.log("Checkbox onChange", e.target.checked);
                    updateField(photo.id, "isWatermark", e.target.checked);
                  }}
                  checked={photo.isWatermark}
                />
              </Tooltip>
            </div>
          </div>
        </>
      )}

      {photo.status === "uploading" && (
        <div
          className="absolute h-52 inset-0 bg-gray-100 opacity-70 z-10 flex items-center justify-center rounded-lg cursor-default "
          style={{ pointerEvents: "none" }} // Disable hover
        >
          <Spin />{" "}
          <p className="text-black text-sm font-bold">{photo.percent}%</p>
        </div>
      )}
    </div>
  );
}

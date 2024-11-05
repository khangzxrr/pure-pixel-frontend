import React from "react"; // Added useState import
import useBookingPhotoStore from "../../../states/UseBookingPhotoStore";
import { Checkbox, Progress, Tooltip } from "antd";
import { DeleteOutlined } from "@ant-design/icons"; // Ensure you have this import
export default function VerticalScrollingBar() {
  const {
    photoArray,
    setSelectedPhotoByUid,
    updatePhotoPropertyByUid,
    selectedPhoto,
  } = useBookingPhotoStore();
  const handleSelect = (photo) => {
    setSelectedPhotoByUid(photo.file.uid);
  };
  return (
    <div className="flex flex-col overflow-x-auto scrollbar-hidden w-fit">
      {photoArray.map((photo, index) => (
        <div className="relative w-full flex-shrink-0 p-2">
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
          {photo.status !== "done" && (
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
            {/* <div className="h-8 w-8 absolute top-2 right-2 flex justify-center items-center z-20 bg-red-300 bg-opacity-30 backdrop-blur-md   rounded-full">
          <Tooltip title="Delete Photo">
            <DeleteOutlined
              className="text-white text-xl cursor-pointer hover:text-red-500"
              onClick={(e) => {
                e.stopPropagation(); // Prevent triggering the parent onClick
                handleRemove(photo);
              }}
            />
          </Tooltip>
        </div> */}
          </>
        </div>
      ))}
    </div>
  );
}

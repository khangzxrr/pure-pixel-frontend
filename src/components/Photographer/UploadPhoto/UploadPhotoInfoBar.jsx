import React from "react";
import UploadPhotoForm from "./UploadPhotoForm";
import "./UploadPhoto.css";
import useUploadPhotoStore from "../../../states/UploadPhotoState";
export default function UploadPhotoInfoBar() {
  const { selectedPhoto, getPhotoByUid } = useUploadPhotoStore();

  const photoData = getPhotoByUid(selectedPhoto);

  return (
    <div className="w-full h-full mx-auto overflow-y-auto scrollbar-hidden">
      <div>
        <p className="text-white text-lg font-semibold p-3">
          Thông tin bức ảnh
        </p>
        <UploadPhotoForm selectedPhoto={photoData} />
      </div>
      {/* ) : (
        <div className="h-screen flex justify-center items-center">
          <div className="h-1/2">
            <Spin size="large" />
          </div>
        </div>
      )} */}
    </div>
  );
}

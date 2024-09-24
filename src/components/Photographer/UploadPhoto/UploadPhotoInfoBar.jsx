import React from "react";
import { Spin, Steps } from "antd";
import useUploadPhotoStore from "../../../states/UploadPhotoState";
import UploadPhotoForm from "./UploadPhotoForm";
import UploadPhotoExtraOption from "./UploadPhotoExtraOption";
import "./UploadPhoto.css";
export default function UploadPhotoInfoBar() {
  const { photoList, deleteImageById, setSelectedPhoto, selectedPhoto } =
    useUploadPhotoStore();
  console.log(selectedPhoto);

  return (
    <div className="w-full h-full mx-auto overflow-y-auto scrollbar-hidden">
      {selectedPhoto.status === "PARSED" ? (
        <div>
          <p className="text-white text-lg font-semibold p-3">
            Thông tin bức ảnh
          </p>
          <UploadPhotoForm />
          <UploadPhotoExtraOption />
        </div>
      ) : (
        <div className="h-screen flex justify-center items-center">
          <div className="h-1/2">
            <Spin size="large" />
          </div>
        </div>
      )}
    </div>
  );
}

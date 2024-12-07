import React from "react";
import UploadPhotoForm from "./UploadPhotoForm";
// import "./UploadPhoto.css";
import useUploadPhotoStore from "../../../states/UploadPhotoState";
export default function UploadPhotoInfoBar({ photoData }) {
  const isDisableUpdatePhoto = !photoData || photoData.status !== "done";
  return (
    <div className="w-full h-full mx-auto overflow-y-auto custom-scrollbar">
      {isDisableUpdatePhoto && (
        <div
          className="absolute inset-0 bg-black h-screen bg-opacity-50 z-20 flex items-center justify-center cursor-not-allowed"
          style={{ top: 0, left: 0 }}
        />
      )}
      <div>
        <p className="text-white text-lg font-semibold p-3">
          Thông tin bức ảnh
        </p>
        <UploadPhotoForm selectedPhoto={photoData} />
      </div>
    </div>
  );
}

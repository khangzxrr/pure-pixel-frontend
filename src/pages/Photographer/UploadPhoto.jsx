import { CloudUploadOutlined, DeleteOutlined } from "@ant-design/icons";
import React, { useState } from "react";
import useUploadPhotoStore from "../../states/UploadPhotoState";
import CustomUpload from "../../components/Photographer/UploadPhoto/CustomUpload";
import UploadPhotoInfoBar from "../../components/Photographer/UploadPhoto/UploadPhotoInfoBar";

export default function UploadPhoto() {
  const { photoList, deleteImageById, setSelectedPhoto, selectedPhoto } =
    useUploadPhotoStore();

  const imageListContainerClasses = `w-1/2 px-3 flex flex-wrap gap-2 

    `;
  return (
    <div className="flex py-9 h-screen">
      <div className="flex flex-col w-5/6 mx-auto bg-white rounded-lg border-[1px]">
        <div className="w-full flex px-5 py-2 shadow-lg hover:shadow-xl transition-all duration-300">
          <CloudUploadOutlined style={{ fontSize: "48px" }} />
          <p className="text-2xl p-3">Upload your photos</p>
        </div>
        <div className="w-full flex overflow-hidden pt-9 px-6">
          <div className={imageListContainerClasses}>
            <CustomUpload />
          </div>
          <div className="w-1/2 px-3">
            <UploadPhotoInfoBar />
          </div>
        </div>
      </div>
    </div>
  );
}

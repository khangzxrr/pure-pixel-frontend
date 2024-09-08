import { Steps, Input, Select } from "antd";
import { CloudUploadOutlined, DeleteOutlined } from "@ant-design/icons";
import React, { useState } from "react";
import useUploadPhotoStore from "../../zustand/UploadPhotoState";
import UploadPhotoForm from "../../components/Photographer/UploadPhoto/UploadPhotoForm";
import UploadPhotoExtraOption from "../../components/Photographer/UploadPhoto/UploadPhotoExtraOption";
import CustomUpload from "../../components/Photographer/UploadPhoto/CustomUpload";

export default function UploadPhoto() {
  const { photoList, deleteImageById, setSelectedPhoto, selectedPhoto } =
    useUploadPhotoStore();

  const imageListContainerClasses = `w-1/2 px-3 flex flex-wrap gap-2 ${
    photoList.length > 6 ? "h-[90%] overflow-y-scroll" : ""
  }`;
  // console.log("selectedPhoto", selectedPhoto);
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
            {photoList.map((image) => (
              <div
                className={`relative w-[30%] cursor-pointer ${
                  photoList.length <= 3 ? "h-1/2" : "pb-[30%]"
                } ${
                  image.id === selectedPhoto?.id
                    ? " border-4 border-black"
                    : " hover:scale-105 transition-all duration-300"
                }`}
                key={image.id}
                onClick={() => setSelectedPhoto(image)}
              >
                <img
                  src={image.thumbnailPhotoUrl}
                  alt={image.id}
                  className="absolute top-0 left-0 w-full h-full object-cover"
                />
                <DeleteOutlined
                  className="absolute top-2 right-2 text-white text-xl cursor-pointer hover:text-red-500"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent triggering the parent onClick
                    deleteImageById(image.id);
                  }}
                />
              </div>
            ))}
          </div>
          <div className="w-1/2 px-3">
            <div className="w-full mx-auto">
              <Steps
                size="small"
                current={selectedPhoto.currentStep}
                items={[
                  {
                    title: "Photos",
                    description: "Upload your photos",
                  },
                  {
                    title: "Details",
                    description: "Enter image details",
                  },
                  {
                    title:
                      selectedPhoto.currentStep === 2 ||
                      selectedPhoto.currentStep === 3
                        ? "Extra Details"
                        : "Waiting",
                    description: "Enter additional details",
                  },
                ]}
              />

              {selectedPhoto.currentStep === 1 ? (
                <UploadPhotoForm />
              ) : selectedPhoto.currentStep >= 2 ? (
                <UploadPhotoExtraOption />
              ) : (
                ""
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import React from "react";
import { Steps } from "antd";
import useUploadPhotoStore from "../../../states/UploadPhotoState";
import UploadPhotoForm from "./UploadPhotoForm";
import UploadPhotoExtraOption from "./UploadPhotoExtraOption";
export default function UploadPhotoInfoBar() {
  const { photoList, deleteImageById, setSelectedPhoto, selectedPhoto } =
    useUploadPhotoStore();
  console.log(selectedPhoto);

  return (
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
              selectedPhoto?.currentStep === 2 ||
              selectedPhoto?.currentStep === 3
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
  );
}

import { Steps, Input, Select } from "antd";
import { CloudUploadOutlined, PlusOutlined } from "@ant-design/icons";
import React from "react";
import useUploadPhotoStore from "../../zustand/UploadPhotoState";
import { ImageList } from "../../fakejson/ImageList";
import UploadPhotoForm from "../../components/Photographer/UploadPhoto/UploadPhotoForm";
import UploadPhotoExtraOption from "../../components/Photographer/UploadPhoto/UploadPhotoExtraOption";

export default function UploadPhoto() {
  const { currentStep, setCurrentStep } = useUploadPhotoStore();

  const imageListContainerClasses = `w-1/2 px-3 flex flex-wrap gap-2 ${
    ImageList.length > 6 ? "h-[90%] overflow-y-scroll" : ""
  }`;

  return (
    <div className="flex py-9 h-screen">
      <div className="flex flex-col w-5/6 mx-auto bg-white rounded-lg border-[1px]">
        <div className="w-full flex px-5 py-2 shadow-lg">
          <CloudUploadOutlined style={{ fontSize: "48px" }} />
          <p className="text-2xl p-3">Upload your photos</p>
        </div>
        <div className="w-full flex pt-9 px-6">
          <div className={imageListContainerClasses}>
            <div className="relative w-[30%] pb-[30%] bg-slate-500 flex justify-center items-center">
              <div className="absolute top-0 left-0 w-full h-full flex justify-center items-center">
                <PlusOutlined style={{ fontSize: "48px" }} />
              </div>
            </div>
            {ImageList.map((image) => (
              <div className="relative w-[30%] pb-[30%]" key={image.id}>
                <img
                  src={image.image}
                  alt={image.id}
                  className="absolute top-0 left-0 w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
          <div className="w-1/2 px-3">
            <div className="w-full mx-auto">
              <Steps
                size="small"
                current={currentStep}
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
                      currentStep === 2 || currentStep === 3
                        ? "Extra Details"
                        : "Waiting",
                    description: "Enter additional details",
                  },
                ]}
              />

              {currentStep === 1 ? (
                <UploadPhotoForm />
              ) : currentStep >= 2 ? (
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

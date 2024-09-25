import { ArrowLeftOutlined, ArrowRightOutlined } from "@ant-design/icons";
import React, { useState } from "react";
import CustomUpload from "../../components/Photographer/UploadPhoto/CustomUpload";
import UploadPhotoInfoBar from "../../components/Photographer/UploadPhoto/UploadPhotoInfoBar";
import { Spin, Switch, Tooltip } from "antd";
import OverviewModal from "../../components/Photographer/UploadPhoto/OverviewModal";
import useUploadPhotoStore from "../../states/UploadPhotoState";

export default function UploadPhoto() {
  const {
    selectedPhoto,
    photoList,
    setNextSelectedPhoto,
    setPreviousSelectedPhoto,
  } = useUploadPhotoStore();

  return (
    <div className="flex h-screen justify-end">
      <div className="flex flex-col w-5/6 bg-gray-500">
        <div className={`w-full ${photoList.length > 0 ? "h-1/3" : "h-full"}`}>
          <CustomUpload />
        </div>
        {photoList.length > 0 && (
          <div className="w-full flex overflow-hidden">
            <div className="w-2/3 bg-gray-800 p-7 relative flex justify-center items-center">
              {photoList.length > 1 && (
                <div
                  className="absolute left-1 top-1/2 transform -translate-y-1/2 text-4xl hover:scale-110 text-white bg-slate-500 p-1 rounded-md opacity-70 hover:opacity-90 cursor-pointer"
                  onClick={() => setPreviousSelectedPhoto()}
                >
                  <ArrowLeftOutlined />
                </div>
              )}
              {selectedPhoto.status === "PARSED" ? (
                <img
                  src={
                    selectedPhoto?.upload_url || selectedPhoto?.signedUrl?.url
                  }
                  className="max-w-full max-h-full shadow-gray-600 shadow-xl drop-shadow-none"
                  alt="Selected Photo"
                />
              ) : (
                <div>
                  <Spin size="large" />
                </div>
              )}

              {photoList.length > 1 && (
                <div
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 text-4xl hover:scale-110 text-white bg-slate-500 p-1 rounded-md opacity-70 hover:opacity-90 cursor-pointer"
                  onClick={() => setNextSelectedPhoto()}
                >
                  <ArrowRightOutlined />
                </div>
              )}
            </div>

            <div className="w-1/3 overflow-y-auto px-3 bg-gray-700">
              <UploadPhotoInfoBar />
            </div>
          </div>
        )}
        <OverviewModal />
      </div>
    </div>
  );
}

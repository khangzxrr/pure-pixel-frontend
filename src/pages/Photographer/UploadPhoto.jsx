import { ArrowLeftOutlined, ArrowRightOutlined } from "@ant-design/icons";
import React, { useEffect } from "react";
import CustomUpload from "../../components/Photographer/UploadPhoto/CustomUpload";
import UploadPhotoInfoBar from "../../components/Photographer/UploadPhoto/UploadPhotoInfoBar";
import OverviewModal from "../../components/Photographer/UploadPhoto/OverviewModal";
import useUploadPhotoStore from "../../states/UploadPhotoState";

export default function UploadPhoto() {
  const {
    photoArray,
    selectedPhoto,
    setPreviousSelectedPhoto,
    setNextSelectedPhoto,
  } = useUploadPhotoStore();

  return (
    <div className="flex h-[93%] justify-end">
      <div className="flex flex-col w-full ">
        <div className={`w-full ${photoArray.length > 0 ? "h-1/3" : "h-1/2"}`}>
          <CustomUpload />
        </div>
        {photoArray.length > 0 && (
          <div className="w-full flex overflow-hidden">
            <div className="w-2/3 bg-[#292b2f] p-7 relative flex justify-center items-center">
              {photoArray.length > 1 && (
                <>
                  <div
                    className="absolute left-1 top-1/2 transform -translate-y-1/2 text-4xl hover:scale-110 text-white bg-slate-500 p-1 rounded-md opacity-70 hover:opacity-90 cursor-pointer z-10"
                    onClick={() => setPreviousSelectedPhoto()}
                  >
                    <ArrowLeftOutlined />
                  </div>
                  <div
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 text-4xl hover:scale-110 text-white bg-slate-500 p-1 rounded-md opacity-70 hover:opacity-90 cursor-pointer z-10"
                    onClick={() => setNextSelectedPhoto()}
                  >
                    <ArrowRightOutlined />
                  </div>
                </>
              )}

              <img
                src={selectedPhoto?.reviewUrl}
                className="max-w-full max-h-full shadow-gray-600 shadow-xl drop-shadow-none z-0"
                alt="Selected Photo"
              />
            </div>

            <div className="w-1/3 overflow-y-auto px-3 bg-[#2f3136]">
              <UploadPhotoInfoBar />
            </div>
          </div>
        )}

        <OverviewModal />
      </div>
    </div>
  );
}

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
    getPhotoByUid,
  } = useUploadPhotoStore();

  const photoData = getPhotoByUid(selectedPhoto);
  console.log("photoData", photoData?.file?.uid);
  return (
    <div className="h-screen overflow-hidden bg-red-400">
      <div className="flex flex-col h-[95%] overflow-hidden">
        <div className="flex flex-col w-full h-full overflow-hidden">
          <div className={`flex ${photoArray.length > 0 ? "h-1/3" : "h-1/2"}`}>
            <CustomUpload />
          </div>
          {photoArray.length > 0 && (
            <div className="w-full h-2/3 flex overflow-hidden">
              <div className="w-2/3 h-full bg-[#292b2f] p-7 relative flex justify-center items-center overflow-hidden">
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
                  src={photoData?.reviewUrl}
                  className="h-full shadow-gray-600 shadow-xl drop-shadow-none z-0"
                  alt="Selected Photo"
                />
              </div>

              <div className="w-1/3 h-full px-3 bg-[#2f3136] overflow-hidden">
                <UploadPhotoInfoBar />
              </div>
            </div>
          )}

          <OverviewModal />
        </div>
      </div>
    </div>
  );
}

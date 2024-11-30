import { ArrowLeftOutlined, ArrowRightOutlined } from "@ant-design/icons";
import React, { useEffect } from "react";
import CustomUpload from "../../components/Photographer/UploadPhoto/CustomUpload";
import UploadPhotoInfoBar from "../../components/Photographer/UploadPhoto/UploadPhotoInfoBar";
import OverviewModal from "../../components/Photographer/UploadPhoto/OverviewModal";
import useUploadPhotoStore from "../../states/UploadPhotoState";
import MapBoxModal from "../../components/Photographer/UploadPhoto/MapBoxModal";
import useUpgradePackageStore from "../../states/UseUpgradePackageStore";

export default function UploadPhoto() {
  const {
    photoArray,
    selectedPhoto,
    setPreviousSelectedPhoto,
    setNextSelectedPhoto,
    getPhotoByUid,
    uidHashmap,
  } = useUploadPhotoStore();
  const photoData =
    getPhotoByUid(selectedPhoto) !== undefined
      ? getPhotoByUid(selectedPhoto)
      : getPhotoByUid(uidHashmap[0]);
  console.log("photoData", photoData, selectedPhoto);

  return (
    <div className="mt-5">
      <div className="flex flex-col h-[99vh]">
        <div className="flex flex-col w-full h-full">
          <div className={`flex ${photoArray.length > 0 ? "" : "h-1/2"}`}>
            <CustomUpload />
          </div>
          {photoArray.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-10 gap-4 h-3/4 lg:h-2/3 bg-[#2f3136]">
              <div className="col-span-10 md:col-span-4 h-full bg-[#292b2f] p-7 relative flex justify-center items-center overflow-hidden">
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
                {photoData.watermark && (
                  <div className="absolute top-1/2 text-4xl  text-gray-700 z-10">
                    PXL
                  </div>
                )}
                <img
                  src={photoData?.reviewUrl}
                  className="h-full shadow-gray-600 shadow-xl drop-shadow-none z-0"
                  alt="Selected Photo"
                />
              </div>

              <div className="col-span-10 md:col-span-6 h-full overflow-hidden">
                <UploadPhotoInfoBar photoData={photoData} />
              </div>
            </div>
          )}

          {/* <OverviewModal /> */}
          <MapBoxModal />
        </div>
      </div>
    </div>
  );
}

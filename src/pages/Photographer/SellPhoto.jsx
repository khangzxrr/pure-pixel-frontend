import { ArrowLeftOutlined, ArrowRightOutlined } from "@ant-design/icons";
import React, { useEffect, useRef } from "react";
import useSellPhotoStore from "../../states/UseSellPhotoState";
import UploadPhotoSell from "./components/UploadPhotoSell.jsx";
import UploadPhotoSellInfoBar from "./components/UploadPhotoSellInfoBar.jsx";
import MapBoxModal from "./components/MapBoxModal.jsx";

export default function SellPhoto() {
  const {
    photoArray,
    selectedPhoto,
    setPreviousSelectedPhoto,
    setNextSelectedPhoto,
    getPhotoByUid,
    uidHashmap,
    setSelectedPhotoByUid,
    isOpenMapModal,
  } = useSellPhotoStore();
  const formRef = useRef();

  const photoData =
    getPhotoByUid(selectedPhoto) !== undefined
      ? getPhotoByUid(selectedPhoto)
      : getPhotoByUid(uidHashmap[Object.keys(uidHashmap)[0]]);
  console.log("photoData", photoData, selectedPhoto, uidHashmap);
  useEffect(() => {
    if (photoArray && photoArray.length > 0 && selectedPhoto === null) {
      setSelectedPhotoByUid(photoArray[0]?.file?.uid);
    }
  }, [photoArray]);
  return (
    <div className="">
      <div className="flex flex-col h-[99vh]">
        <div className="flex flex-col w-full h-full">
          <div
            className={`flex ${
              photoArray && photoArray.length > 0 ? "" : "h-1/2"
            }`}
          >
            <UploadPhotoSell formRef={formRef} />
          </div>
          {photoArray && photoArray.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-10 gap-4 h-3/4 lg:h-2/3 bg-[#2f3136]">
              <div className="col-span-10 md:col-span-4 h-full bg-[#292b2f] p-7 relative flex justify-center items-center overflow-hidden">
                {photoArray.length > 1 && (
                  <>
                    <div
                      className="absolute left-1 top-1/2 transform -translate-y-1/2 text-4xl hover:scale-110 text-white bg-slate-500 p-1 rounded-md opacity-70 hover:opacity-90 cursor-pointer z-10"
                      onClick={() => setPreviousSelectedPhoto()}
                      disabled={selectedPhoto === null}
                    >
                      <ArrowLeftOutlined />
                    </div>
                    <div
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 text-4xl hover:scale-110 text-white bg-slate-500 p-1 rounded-md opacity-70 hover:opacity-90 cursor-pointer z-10"
                      onClick={() => setNextSelectedPhoto()}
                      disabled={selectedPhoto === null}
                    >
                      <ArrowRightOutlined />
                    </div>
                  </>
                )}
                <img
                  src={photoData?.reviewUrl}
                  className="w-full shadow-gray-600 shadow-xl drop-shadow-none z-0"
                  alt="Selected Photo"
                />
              </div>

              <div className="col-span-10 md:col-span-6 h-full overflow-hidden">
                <UploadPhotoSellInfoBar
                  reference={formRef}
                  selectedPhoto={photoData}
                />
              </div>
            </div>
          )}
        </div>
      </div>
      {isOpenMapModal && <MapBoxModal />}
    </div>
  );
}

import React from "react";
export default function UploadPhotoSellInfoBar({ photoData }) {
  return (
    <div className="w-full h-full mx-auto overflow-y-auto custom-scrollbar">
      <div>
        <p className="text-white text-lg font-semibold p-3">
          Thông tin bức ảnh
        </p>
        {/* <UploadPhotoForm selectedPhoto={photoData} /> */}
      </div>
    </div>
  );
}

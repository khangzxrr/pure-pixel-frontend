import React from "react";

const MyPhotoP = () => {
  return (
    <div className="flex gap-1 flex-wrap hover:cursor-pointer">
      <div className="relative group ">
        <div className="w-[320px] h-[320px] overflow-hidden ">
          <img
            className="w-full h-full object-cover"
            src="https://picsum.photos/1920/1080?random=1"
            alt=""
          />
        </div>
        <div className="absolute bottom-0 left-0 w-full bg-black bg-opacity-50 text-white text-center py-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-md">
          <div className="flex justify-between px-1">
            <div>Tiêu đề ảnh</div>
            <div>Danh mục ảnh</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyPhotoP;

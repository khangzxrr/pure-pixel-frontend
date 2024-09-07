import React from "react";
import { FaArrowUp } from "react-icons/fa6";
import MyPhotoAll from "../MyPhotoAll/MyPhotoAll";

const MyPhotoPrivate = () => {
  return (
    <div className="flex flex-col">
      <div className="p-10">
        <button className="bg-white  outline outline-1 outline-gray-300 rounded-sm px-5 py-1 hover:bg-blue-100">
          Chọn
        </button>
      </div>
      <div className="flex flex-wrap pl-10 pt-5 gap-5 ">
        <div className="flex flex-col gap-3 justify-center items-center w-[360px] h-[420px] transition-shadow duration-200 bg-white hover:shadow-xl hover:cursor-pointer">
          <div>
            <FaArrowUp className="text-4xl" />
          </div>
          <div className="text-xl font-bold">Tải lên ảnh của bạn</div>
          <div>
            <button className="text-white text-xl font-bold bg-blue-500  rounded-3xl px-10 py-2 hover:bg-blue-400">
              Tải lên
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-3 w-[360px] h-[420px] transition-shadow duration-200 bg-white hover:shadow-xl hover:cursor-pointer">
          <div>
            <img src="https://picsum.photos/800/800?random=2" alt="" />
          </div>
          <div className="flex justify-between items-center px-3">
            <div className="text-xl font-bold">Ảnh riêng tư</div>
            <div className="text-gray-500 ">Riêng tư</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyPhotoPrivate;

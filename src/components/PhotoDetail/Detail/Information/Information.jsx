import React from "react";
import { RxAvatar } from "react-icons/rx";
const Information = () => {
  return (
    <div className="flex flex-col justify-center items-center bg-white p-5 gap-3 shadow-lg rounded-lg">
      <div className="w-40 h-40 overflow-hidden rounded-full">
        <img
          src="https://vnn-imgs-a1.vgcloud.vn/image1.ictnews.vn/_Files/2020/03/17/trend-avatar-1.jpg"
          alt=""
          className="w-full h-full object-cover"
        />
      </div>

      <div className="text-xl font-bold">Võ Ngọc Khang</div>
      <div className="text-md font-bold">Đồng Nai</div>
      <button className="bg-blue-500 text-white rounded-md px-5 py-1 hover:opacity-80">
        Theo dõi
      </button>
    </div>
  );
};

export default Information;

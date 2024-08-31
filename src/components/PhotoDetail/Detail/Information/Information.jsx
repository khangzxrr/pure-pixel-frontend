import React from "react";
import { RxAvatar } from "react-icons/rx";
const Information = () => {
  return (
    <div className="flex flex-col justify-center items-center bg-white p-5 gap-3 shadow-lg rounded-lg">
      <RxAvatar className="w-40 h-40" />
      <div className="text-xl font-bold">Võ Ngọc Khang</div>
      <div className="text-md font-bold">Đồng Nai</div>
      <button className="bg-blue-500 text-white rounded-md px-5 py-1 hover:opacity-80">
        Theo dõi
      </button>
    </div>
  );
};

export default Information;

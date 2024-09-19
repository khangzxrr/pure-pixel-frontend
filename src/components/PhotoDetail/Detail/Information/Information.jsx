import React from "react";
const Information = ({ name, avatar, quote }) => {
  return (
    <div className="flex flex-col justify-center items-center bg-white p-5 gap-3 shadow-lg rounded-lg">
      <div className="w-40 h-40 overflow-hidden rounded-full">
        <img
          src={
            avatar ||
            "https://vnn-imgs-a1.vgcloud.vn/image1.ictnews.vn/_Files/2020/03/17/trend-avatar-1.jpg"
          }
          alt=""
          className="w-full h-full object-cover"
        />
      </div>

      <div className="text-xl font-bold">{name || "Không xác định"}</div>
      <div className="text-md text-center">
        {quote ? `"${quote}"` : '"Không xác định"'}
      </div>
      <button className="bg-blue-500 text-white rounded-md px-5 py-1 hover:opacity-80">
        Theo dõi
      </button>
    </div>
  );
};

export default Information;

import React from "react";

export default function PhNotification({ notification }) {
  return (
    <div className="border-b border-gray-500 px-1 py-2" key={notification.id}>
      <div className="flex items-center gap-2 p-2 rounded-sm hover:cursor-pointer hover:bg-gray-500 transition-colors duration-200">
        <div className="w-[35px] h-[35px] overflow-hidden rounded-full">
          <img
            src="https://vnn-imgs-a1.vgcloud.vn/image1.ictnews.vn/_Files/2020/03/17/trend-avatar-1.jpg"
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
        <div className="w-[225px] lg:w-[335px] text-sm lg:text-base">
          {/* <span className="font-bold">{notification.name}</span> đã bắt
                  đầu theo dõi bạn */}
          {notification.content}
          <span className="text-red-500">{notification.referenceType}</span>
        </div>
      </div>
    </div>
  );
}

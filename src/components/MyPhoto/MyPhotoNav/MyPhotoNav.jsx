import React, { useState } from "react";
import { BsPersonCircle } from "react-icons/bs";
import MyPhotoNavItem from "./MyPhotoNavItem";
import { Link, useLocation } from "react-router-dom";

const MyPhotoNav = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.pathname);

  const handleTabClick = (link) => {
    setActiveTab(link);
  };

  return (
    <div className="col-span-2 shadow-md">
      <div className="flex flex-col justify-center items-center gap-3 bg-gray-100 py-14">
        <div className="w-20 h-20 overflow-hidden rounded-full">
          {/* <BsPersonCircle className="w-20 h-20" /> */}
          <img
            className="w-full h-full object-cover"
            src="https://vnn-imgs-a1.vgcloud.vn/image1.ictnews.vn/_Files/2020/03/17/trend-avatar-1.jpg"
            alt=""
          />
        </div>
        <div className="font-bold text-center text-lg lg:block hidden">
          Nguyễn Thành Trung
        </div>
      </div>

      <div className="flex flex-col mt-3 ">
        {MyPhotoNavItem.map((item) => (
          <Link to={item.link} key={item.name} className="flex flex-col">
            <div
              className={`flex lg:flex-row flex-col items-center gap-5 lg:pl-10 pl-0 py-5 transition-colors duration-200 ${
                activeTab === item.link
                  ? "bg-[#0870d1] text-white"
                  : "hover:bg-blue-100 hover:text-[#0870d1] text-black"
              }`}
              title={item.name}
              onClick={() => handleTabClick(item.link)}
            >
              <div
                className={`text-3xl transition-colors duration-200 ${
                  activeTab === item.link ? "text-white" : "text-[#0870d1]"
                }`}
              >
                {item.icon}
              </div>
              <div className="text-lg lg:block hidden">{item.name}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default MyPhotoNav;

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
        <div>
          <BsPersonCircle className="w-20 h-20" />
        </div>
        <div className="font-bold">Nguyễn Thành Trung</div>
      </div>
      <div className="flex flex-col mt-3">
        {MyPhotoNavItem.map((item) => (
          <Link to={item.link} key={item.name}>
            <div
              className={`flex items-center gap-5 pl-10 py-5 transition-colors duration-200 ${
                activeTab === item.link
                  ? "bg-[#0870d1] text-white"
                  : "hover:bg-blue-100 hover:text-[#0870d1] text-black"
              }`}
              onClick={() => handleTabClick(item.link)}
            >
              <div
                className={`text-3xl transition-colors duration-200 ${
                  activeTab === item.link ? "text-white" : "text-[#0870d1]"
                }`}
              >
                {item.icon}
              </div>
              <div className="text-lg">{item.name}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default MyPhotoNav;

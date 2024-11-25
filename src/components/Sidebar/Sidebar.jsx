import React, { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import UseSidebarStore from "../../states/UseSidebarStore";
import PhotoTagsTrend from "../Explore/PhotoTagsTrend";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { IoMdArrowDropdown } from "react-icons/io";
import UseCategoryStore from "./../../states/UseCategoryStore";
import InsPhotoFilter from "./../Inspiration/InspirationPhoto/InsPhotoFilter";
import PhotographerFilter from "../Photographer/PhotographerList/PhotographerFilter";
import UseUserOtherStore from "../../states/UseUserOtherStore";
import UsePhotographerFilterStore from "../../states/UsePhotographerFilterStore";
const Sidebar = ({
  sideItems,
  trendItems,
  handleClick,
  isUpload,
  isImg,
  isUser,
  nameUser,
  isBlog,
  isCamera,
  isOtherProfile,
}) => {
  const location = useLocation();
  const { activeLink, setActiveLink, isSidebarOpen, toggleSidebar } =
    UseSidebarStore();
  const nameUserOther = UseUserOtherStore((state) => state.nameUserOther);
  const setNameUserOther = UseUserOtherStore((state) => state.setNameUserOther);
  const isInspirationPage = location.pathname === "/explore/inspiration";
  const isPhotographer = location.pathname === "/explore/photographers";

  useEffect(() => {
    const currentItem = sideItems.find(
      (item) => item.link === location.pathname
    );
    if (currentItem && activeLink !== currentItem.id) {
      setActiveLink(currentItem.id);
      handleClick(
        currentItem.id,
        currentItem.title,
        currentItem.icon,
        currentItem.quote
      );
    }
  }, [location.pathname, activeLink, setActiveLink, handleClick, sideItems]);

  useEffect(
    () => {
      if (!location.pathname === "/user") {
        setNameUserOther("");
      }
    },
    [location.pathname],
    setNameUserOther,
    nameUserOther
  );

  return (
    <div className="flex flex-col max-h-screen gap-3 w-full">
      {isUser && (
        <div className=" flex-grow">
          <div className="flex px-2 h-[50px] bg-[#36393f] outline outline-bottom outline-1 outline-[#202225] shadow-xl text-[#eee] items-center gap-3">
            {nameUser || "User"}
          </div>
        </div>
      )}
      {isImg && (
        // <div className=" h-[150px] overflow-hidden">
        //   <img
        //     className="w-full h-full object-cover"
        //     src="https://picsum.photos/1920/1080?random=1"
        //     alt=""
        //   />
        // </div>
        <div className=" flex-grow">
          <div className="flex px-2 h-[50px] bg-[#36393f] outline outline-bottom outline-1 outline-[#202225] shadow-xl text-[#eee] items-center gap-3">
            {"Khám phá"}
          </div>
        </div>
      )}
      {isUpload && (
        <div className=" ">
          <div className="flex px-2 h-[50px] bg-[#36393f] outline outline-bottom outline-2 outline-[#1d1f22] shadow-xl text-[#eee] items-center gap-3">
            Tải lên
          </div>
        </div>
      )}
      {isBlog && (
        <div className=" flex-grow">
          <div className="flex px-2 h-[48px] bg-[#36393f] outline outline-bottom outline-2 outline-[#1d1f22] shadow-xl text-[#eee] items-center gap-3">
            Trang chủ
          </div>
        </div>
      )}
      {isCamera && (
        <div className=" flex-grow">
          <div className="flex px-2 h-[48px] bg-[#36393f]  shadow-xl text-[#eee] items-center gap-3">
            Máy ảnh
          </div>
        </div>
      )}

      {isOtherProfile && (
        <div className=" flex-grow">
          <div className="flex px-2 h-[48px] bg-[#36393f]  shadow-xl text-[#eee] items-center gap-3">
            <span className="truncate max-w-[200px]">
              {nameUserOther || "Hồ sơ"}
            </span>
          </div>
        </div>
      )}

      <div className="flex flex-col mx-2 gap-1 justify-center ">
        {sideItems.map((item) => (
          <Link
            to={item.link}
            key={item.id}
            onClick={() => {
              handleClick(item.id, item.title, item.icon, item.quote);
              setActiveLink(item.id);
              toggleSidebar();
            }}
            className={`flex text-[#a3a3a3] items-center gap-3 hover:cursor-pointer hover:bg-gray-500 hover:text-[#eee] rounded-md transition-colors duration-200
            ${
              activeLink === item.id || activeLink === item.link
                ? "bg-gray-500 text-[#eee] "
                : ""
            }`}
          >
            <div className="flex items-center justify-center w-12 h-12">
              <div className="flex justify-center items-center text-2xl">
                {item.icon}
              </div>
            </div>
            <div className="text-[15px]">{item.title}</div>
          </Link>
        ))}
        {isInspirationPage && (
          <div className="flex flex-col text-[#a3a3a3] gap-2 mt-2 mx-1 border-y-[1px] border-[#a3a3a3] py-2">
            <div>Bộ lọc ảnh</div>
            <InsPhotoFilter />
          </div>
        )}
        {isInspirationPage && (
          <div className="flex flex-col text-[#a3a3a3] gap-2 mt-2 mx-1">
            <div className="text-[12px]">TOP 5 THẺ THỊNH HÀNH HIỆN TẠI</div>
            <div className="flex flex-col gap-2">
              <PhotoTagsTrend />
            </div>
          </div>
        )}
        {isPhotographer && (
          <div className="flex flex-col text-[#a3a3a3] gap-2 mt-2 mx-1 border-y-[1px] border-[#a3a3a3] py-2">
            <div>Bộ lọc nhiếp ảnh gia</div>
            <PhotographerFilter />
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;

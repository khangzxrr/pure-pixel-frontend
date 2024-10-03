import React, { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import UseSidebarStore from "../../states/UseSidebarStore";
const Sidebar = ({
  sideItems,
  trendItems,
  handleClick,
  isUpload,
  isImg,
  isUser,
  nameUser,
  isBlog,
}) => {
  const location = useLocation();
  const { activeLink, setActiveLink } = UseSidebarStore();

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

  return (
    <div className="flex flex-col max-h-screen gap-3 w-[256px]">
      {isUser && (
        <div className=" flex-grow">
          <div className="flex px-2 h-[50px] bg-[#36393f] outline outline-bottom outline-1 outline-[#202225] shadow-xl text-[#eee] items-center gap-3">
            {nameUser || "User"}
          </div>
        </div>
      )}
      {isImg && (
        <div>
          <img src="https://picsum.photos/290/150" alt="" />
        </div>
      )}
      {isUpload && (
        <div className=" flex-grow">
          <div className="flex px-2 h-[50px] bg-[#36393f] outline outline-bottom outline-2 outline-[#1d1f22] shadow-xl text-[#eee] items-center gap-3">
            Upload
          </div>
        </div>
      )}
      {isBlog && (
        <div className=" flex-grow">
          <div className="flex px-2 h-[48px] bg-[#36393f] outline outline-bottom outline-2 outline-[#1d1f22] shadow-xl text-[#eee] items-center gap-3">
            Blog
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
            }}
            className={`flex text-[#a3a3a3] items-center gap-3 hover:cursor-pointer hover:bg-gray-500 hover:text-[#eee] rounded-md transition-colors duration-200
            ${
              activeLink === item.id || activeLink === item.link
                ? "bg-gray-500 text-[#eee]"
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
        {trendItems && (
          <div className="flex flex-col text-[#a3a3a3] gap-2 mt-2 mx-1">
            <div className="text-[12px]">THỊNH HÀNH HIỆN TẠI</div>
            <div className="flex flex-col gap-2">
              {trendItems.map((item) => (
                <Link
                  key={item.id}
                  to={"#"}
                  onClick={() => handleClick(item.id, item.title)}
                  className={`flex gap-2 items-center hover:cursor-pointer hover:bg-gray-500 hover:text-[#eee] rounded-md px-2 py-[2px] transition-colors duration-200 
                    ${activeLink === item.id ? "bg-gray-500 text-[#eee]" : ""}`}
                >
                  <div className="text-xl">#</div>
                  <div>{item.title}</div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;

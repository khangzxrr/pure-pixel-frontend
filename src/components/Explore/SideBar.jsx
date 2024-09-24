import React from "react";
import { Link } from "react-router-dom";
import { IoSettingsSharp } from "react-icons/io5";

const SideBar = ({
  sideItems,
  trendItems,
  handleClick,
  activeItem,
  userData,
  handleLogout,
  handleLogin,
  handleRegister,
}) => {
  return (
    <div className="flex flex-col gap-3 max-h-screen w-[256px] ">
      {/* Header Image */}
      <div>
        <img src="https://picsum.photos/290/150" alt="" />
      </div>

      {/* Sidebar Items */}
      <div className="overflow-y-auto mb-5 scrollbar scrollbar-width: thin scrollbar-thumb-[#a3a3a3] scrollbar-track-[#36393f] flex-grow">
        <div className="flex flex-col mx-2 gap-1 justify-center mt-2 md:mt-0 ">
          {sideItems.map((item) => (
            <Link
              to={item.link}
              key={item.id}
              onClick={() =>
                handleClick(item.id, item.title, item.icon, item.quote)
              }
              className={`flex text-[#a3a3a3] items-center gap-3 hover:cursor-pointer hover:bg-gray-500 hover:text-[#eee] rounded-md transition-colors duration-200
              ${activeItem === item.id ? "bg-gray-500 text-[#eee]" : ""}`}
            >
              <div className="flex items-center justify-center w-12 h-12">
                <div className="flex justify-center items-center text-2xl">
                  {item.icon}
                </div>
              </div>
              <div className="text-[15px]">{item.title}</div>
            </Link>
          ))}

          {/* Trending Items */}
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
                      ${
                        activeItem === item.id ? "bg-gray-500 text-[#eee]" : ""
                      }`}
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

      {/* Login/Logout Section */}
    </div>
  );
};

export default SideBar;

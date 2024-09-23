import React from "react";
import { Link } from "react-router-dom";
import InspirationSideItemF from "./InspirationSideItemF";
import UseInspirationStore from "../../../states/UseInspirationStore";
import InspirationTrendItem from "./InspirationTrendItem";

const InspirationSideComp = () => {
  const { activeItem, setActiveItem } = UseInspirationStore();

  const handleClick = (id, title, icon, quote) => {
    setActiveItem(id, title, icon, quote);
  };

  return (
    <div className="flex flex-col gap-3 max-h-screen w-[256px] ">
      <div className="">
        <img src="https://picsum.photos/290/150" alt="" />
      </div>
      <div className="overflow-y-auto mb-5">
        <div className="flex flex-col mx-2 gap-1 justify-center mt-2 md:mt-0 ">
          {InspirationSideItemF.map((item) => (
            <Link
              to={item.link}
              key={item.id}
              onClick={() =>
                handleClick(item.id, item.title, item.icon, item.quote)
              }
              className={`flex text-[#a3a3a3]  items-center gap-3 hover:cursor-pointer hover:bg-gray-500 hover:text-[#eee]  rounded-md transition-colors duration-200
              ${activeItem === item.id ? "bg-gray-500 text-[#eee]" : ""}`}
            >
              <div className="flex items-center justify-center w-12 h-12">
                <div className="flex justify-center items-center text-2xl">
                  {item.icon}
                </div>
              </div>
              <div className="text-[15px] ">{item.title}</div>
            </Link>
          ))}
          <div className="flex flex-col text-[#a3a3a3] gap-2 mt-2 mx-1">
            <div className="text-[12px] ">THỊNH HÀNH HIỆN TẠI</div>
            <div className="flex flex-col gap-2">
              {InspirationTrendItem.map((item) => (
                <Link
                  key={item.id}
                  to={"#"}
                  onClick={() => handleClick(item.id, item.title)}
                  className={`flex gap-2 items-center hover:cursor-pointer hover:bg-gray-500 hover:text-[#eee] rounded-md px-2 py-[2px] transition-colors duration-200 
                  ${activeItem === item.id ? "bg-gray-500 text-[#eee]" : ""}`}
                >
                  <div className="text-xl">#</div>
                  <div>{item.title}</div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="">
        <div className="flex flex-col  gap-2 bg-[#2a2d31] p-[12.5px]">
          <button className="bg-[#eee] text-gray-500 hover:bg-[#b8b8b8] transition-colors duration-200 rounded-md px-5 py-1">
            Đăng ký
          </button>
          <button className=" outline outline-1 outline-[#eee] hover:bg-[#5f5f5f91] transition-colors duration-200 text-[#eee] rounded-md px-5 py-1">
            Đăng nhập
          </button>
        </div>
      </div>
    </div>
  );
};

export default InspirationSideComp;

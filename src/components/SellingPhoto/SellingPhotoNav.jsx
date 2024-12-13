import React from "react";
import { FaRegImage, FaSearch } from "react-icons/fa";
import UseSellingPhotoStore from "./../../states/UseSellingPhotoStore";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { BsPersonBoundingBox } from "react-icons/bs";
import { IoMdArrowDropdown } from "react-icons/io";

const SellingPhotoNav = ({ activeIcon, activeTitle, activeQuote }) => {
  const {
    inputValue,
    setInputValue,
    setSearchResult,
    searchResult,
    setPage,
    setSearchByPhotoTitle,
    setSearchCategory,
    searchCategory,
  } = UseSellingPhotoStore();

  const iconMapping = {
    FaRegImage: <FaRegImage />,
    BsPersonBoundingBox: <BsPersonBoundingBox />,
  };

  // Hàm xử lý khi nhấn nút tìm kiếm hoặc nhấn Enter
  const handleSearch = () => {
    setSearchResult(inputValue);
    setPage(1);
  };

  // Hàm xử lý khi người dùng nhấn phím trong ô input
  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };
  return (
    <div className="relative flex items-center  justify-between space-x-4 w-full">
      <div className="relative flex items-center space-x-4">
        <div className="flex gap-2 items-center lg:items-end">
          <div className="flex items-center gap-2 pr-4   border-r-[1px] border-[#777777]">
            <div className="text-2xl pl-2">{activeIcon || "#"}</div>
            <div className="hidden 2xl:block">{activeTitle}</div>
          </div>
          {/* <div className="text-sm font-normal pl-2 text-[#a3a3a3] whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px] md:max-w-[300px] lg:max-w-none">
            {activeQuote}
          </div> */}
        </div>
      </div>
      <div className="flex items-center bg-[#202225] rounded-lg">
        <input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          type="text"
          placeholder={`Tìm kiếm ảnh theo tên ảnh hoặc tên thợ chụp...`}
          className="font-normal text-sm px-2 py-2 lg:w-[30vw]  md:w-[40vw]  w-[60vw] pl-4 bg-[#202225] rounded-lg text-white focus:outline-none"
        />
        <div className="flex items-center px-3">
          <button className="" onClick={handleSearch}>
            <FaSearch />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SellingPhotoNav;

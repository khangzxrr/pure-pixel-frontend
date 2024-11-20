import React from "react";
import { FaSearch } from "react-icons/fa";
import UseSellingPhotoStore from "./../../states/UseSellingPhotoStore";

const SellingPhotoNav = ({ activeIcon, activeTitle, activeQuote }) => {
  const { inputValue, setInputValue, setSearchResult, searchResult } =
    UseSellingPhotoStore();
  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  // Hàm xử lý khi nhấn nút tìm kiếm hoặc nhấn Enter
  const handleSearch = () => {
    setSearchResult(inputValue);
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
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          type="text"
          placeholder={`Tìm kiếm ảnh theo nhiếp ảnh gia...`}
          className="font-normal text-sm px-2 py-2 w-[60vw] sm:w-[20vw] pl-4 bg-[#202225] rounded-lg text-white focus:outline-none"
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

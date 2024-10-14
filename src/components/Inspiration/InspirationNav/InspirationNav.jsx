import React from "react";
import { IoMenu } from "react-icons/io5";
import Categories from "../../Explore/Categories";
import UseCategoryStore from "../../../states/UseCategoryStore";
import { FaSearch } from "react-icons/fa";
const InspirationNav = ({
  toggleSidebar,
  activeIcon,
  activeTitle,
  activeQuote,
}) => {
  const { inputValue, setInputValue, searchResult, setSearchResult } =
    UseCategoryStore();
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
    <>
      <div className="relative flex items-center space-x-4">
        <div className="flex gap-2 items-center lg:items-end">
          <div className="flex items-center gap-2 pr-4 border-r-[1px] border-[#777777]">
            <div className="text-2xl">{activeIcon || "#"}</div>
            <div className="hidden md:block">{activeTitle}</div>
          </div>
          <div className="text-sm font-normal pl-2 text-[#a3a3a3] whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px] md:max-w-[300px] lg:max-w-none">
            {activeQuote}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex items-center bg-[#202225] rounded-lg">
          <input
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            type="text"
            placeholder="Tìm kiếm ảnh theo tên nhiếp ảnh gia..."
            className="font-normal text-sm px-2 py-2 w-[300px] pl-4 bg-[#202225] rounded-lg text-white focus:outline-none"
          />
          <div className="flex items-center px-3">
            <button className="" onClick={handleSearch}>
              <FaSearch />
            </button>
          </div>
        </div>
        <div className="">
          <Categories />
        </div>
      </div>
    </>
  );
};

export default InspirationNav;

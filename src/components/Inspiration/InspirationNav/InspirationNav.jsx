// InspirationNav.js
import React from "react";
import { IoMenu } from "react-icons/io5";
import Categories from "../../Explore/Categories";
import UseCategoryStore from "../../../states/UseCategoryStore";
import { FaSearch } from "react-icons/fa";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import SearchCategoryItems from "./SearchCategoryItems";
import { IoMdArrowDropdown } from "react-icons/io";
import { FaRegImage } from "react-icons/fa6";
import { BsPersonBoundingBox } from "react-icons/bs";

const InspirationNav = ({
  toggleSidebar,
  activeIcon,
  activeTitle,
  activeQuote,
}) => {
  const {
    inputValue,
    setInputValue,
    searchResult,
    setSearchResult,
    setSearchByPhotoTitle,
    setSearchCategory,
    searchCategory,
  } = UseCategoryStore();

  // Ánh xạ giữa tên icon và component thực tế
  const iconMapping = {
    FaRegImage: <FaRegImage />,
    BsPersonBoundingBox: <BsPersonBoundingBox />,
  };

  // Hàm thay đổi danh mục tìm kiếm
  const handleChangeSearchCategory = (name, param, quote, icon) => {
    setSearchCategory(name, param, quote, icon);
    setInputValue(""); // Xóa nội dung ô nhập liệu
    setSearchByPhotoTitle(""); // Đặt lại kết quả tìm kiếm theo tên ảnh
    setSearchResult(""); // Đặt lại kết quả tìm kiếm theo tên nhiếp ảnh gia
  };

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  // Hàm xử lý khi nhấn nút tìm kiếm hoặc nhấn Enter
  const handleSearch = () => {
    if (searchCategory.param === "photoName") {
      setSearchByPhotoTitle(inputValue);
    } else {
      setSearchResult(inputValue);
    }
  };

  // Hàm xử lý khi người dùng nhấn phím trong ô input
  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <>
      <div className="flex items-center space-x-4">
        <div className="flex gap-2 items-center lg:items-end">
          <div className="flex items-center gap-2 pr-4 border-r-[1px] border-[#777777] w-full ">
            <div className="text-left text-2xl">{activeIcon || "#"}</div>
            <div className="hidden 2xl:block ">{activeTitle}</div>
          </div>
        </div>
      </div>
      <div className="flex items-center bg-[#202225] rounded-lg">
        <div>
          <Menu as="div" className="relative w-full inline-block  ">
            <div>
              <MenuButton className="inline-flex items-center w-full justify-center gap-x-1.5 rounded-l-md  px-3 py-2 text-sm font-semibold text-[#eee] bg-[#4e535e]">
                <div className="flex items-center gap-2">
                  <div className="text-xl">
                    {iconMapping[searchCategory.icon]}
                  </div>
                  <div className="hidden 2xl:block">
                    {searchCategory.name || "Tìm theo"}
                  </div>
                </div>
                <IoMdArrowDropdown />
              </MenuButton>
            </div>
            <MenuItems
              transition
              className="absolute left-0 z-10 mt-2 w-48 origin-top rounded-md text-[#eee] bg-[#202225] shadow-lg ring-1 ring-black ring-opacity-5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
            >
              <div className="py-1">
                {SearchCategoryItems.map((item) => (
                  <MenuItem
                    key={item.id}
                    onClick={() =>
                      handleChangeSearchCategory(
                        item.title,
                        item.param,
                        item.quote,
                        item.icon
                      )
                    }
                  >
                    <div className="flex items-center gap-2 px-4 py-2 text-sm data-[focus]:cursor-pointer data-[focus]:bg-[#6b7280] transition-colors duration-200">
                      <div className="text-xl">{iconMapping[item.icon]}</div>
                      <div>{item.title}</div>
                    </div>
                  </MenuItem>
                ))}
              </div>
            </MenuItems>
          </Menu>
        </div>
        <input
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          type="text"
          placeholder={`Tìm kiếm ảnh theo tên ${searchCategory.quote}...`}
          className="font-normal text-sm px-2 py-2 w-[35vw] md:w-[50vw] pl-4 bg-[#202225] rounded-lg text-white focus:outline-none"
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
    </>
  );
};

export default InspirationNav;

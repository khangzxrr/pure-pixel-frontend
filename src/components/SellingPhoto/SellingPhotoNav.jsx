import React from "react";
import { FaRegImage, FaSearch } from "react-icons/fa";
import UseSellingPhotoStore from "./../../states/UseSellingPhotoStore";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { BsPersonBoundingBox } from "react-icons/bs";
import { IoMdArrowDropdown } from "react-icons/io";

const SearchByItems = [
  {
    id: "s1",
    title: "Tên ảnh",
    quote: "ảnh",
    param: "photoName",
    icon: "FaRegImage",
  },
  {
    id: "s2",
    title: "Nhiếp ảnh gia",
    quote: "nhiếp ảnh gia",
    param: "photographerName",
    icon: "BsPersonBoundingBox",
  },
];
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
  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleChangeSearchCategory = (name, param, quote, icon) => {
    setSearchCategory(name, param, quote, icon);
    setInputValue("");
    setSearchByPhotoTitle("");
    setSearchResult("");
  };

  // Hàm xử lý khi nhấn nút tìm kiếm hoặc nhấn Enter
  const handleSearch = () => {
    if (searchCategory.param === "photoName") {
      setSearchByPhotoTitle(inputValue);
    } else {
      setSearchResult(inputValue);
    }
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
                {SearchByItems.map((item) => (
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
          placeholder={`Tìm kiếm ảnh theo tên ${searchCategory.quote}......`}
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

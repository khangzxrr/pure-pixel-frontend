// InspirationNav.js
import type { KeyboardEvent, ReactNode } from "react";
import Categories from "../../Explore/Categories";
import UseCategoryStore from "../../../states/UseCategoryStore";
import { FaSearch } from "react-icons/fa";

type InspirationNavProps = {
  // accepted from Explore but not used here
  toggleSidebar?: () => void;
  activeIcon?: ReactNode;
  activeTitle?: ReactNode;
  // accepted from Explore but not used here
  activeQuote?: ReactNode;
};

const InspirationNav = ({ activeIcon, activeTitle }: InspirationNavProps) => {
  const {
    inputValue,
    setInputValue,
    setSearchResult,
    setSearchByPhotoTitle,
    searchCategory,
    setSearchByTags,
  } = UseCategoryStore();

  // Hàm xử lý khi nhấn nút tìm kiếm hoặc nhấn Enter
  const handleSearch = () => {
    if (searchCategory.param === "photoName") {
      setSearchByPhotoTitle(inputValue);
    } else if (searchCategory.param === "photoTags") {
      setSearchByTags(inputValue);
    } else {
      setSearchResult(inputValue);
    }
  };

  // Hàm xử lý khi người dùng nhấn phím trong ô input
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="flex justify-between items-center w-full">
      <div className="flex items-center space-x-4">
        <div className="flex gap-2 items-center lg:items-start">
          <div className="flex items-center  gap-2 pr-4 border-r-[1px] border-[#777777] w-full ">
            <div className="text-left text-2xl pl-2">{activeIcon || "#"}</div>
            <div className="hidden lg:block ">{activeTitle}</div>
            {/* fix here */}
          </div>
        </div>
      </div>
      <div className="flex items-center bg-[#202225] rounded-lg">
        <input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          type="text"
          placeholder={`Tìm kiếm ảnh theo tên ảnh hoặc tên thợ chụp ảnh...`}
          className="font-normal text-sm px-2 py-2 w-[35vw] sm:w-[40vw] pl-4 bg-[#202225] rounded-lg text-white focus:outline-none"
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
  );
};

export default InspirationNav;

import React from "react";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { IoMdArrowDropdown } from "react-icons/io";
import UseMyPhotoFilter from "../../states/UseMyPhotoFilter";
import { FaSearch } from "react-icons/fa";
import { FaFilterCircleXmark } from "react-icons/fa6";
const filterByDateList = [
  {
    id: "d1",
    name: "Mới nhất",
    param: "desc",
  },
  {
    id: "d2",
    name: "Cũ nhất",
    param: "asc",
  },
];

const filterByUpVoteList = [
  {
    id: "u1",
    name: "Tăng dần",
    param: "asc",
  },
  {
    id: "u2",
    name: "Giảm dần",
    param: "desc",
  },
];
const MyPhotoFilter = () => {
  const { inputValue, setInputValue, setSearchResult } = UseMyPhotoFilter();
  const {
    isWatermarkChecked,
    setIsWatermarkChecked,
    isForSaleChecked,
    setIsForSaleChecked,
  } = UseMyPhotoFilter();
  const handleWatermarkChange = (event) => {
    const isChecked = event.target.checked;
    setIsWatermarkChecked(isChecked);
  };
  const handleForSaleChange = (event) => {
    const isChecked = event.target.checked;
    setIsForSaleChecked(isChecked);
  };

  const setFilterByPhotoDate = UseMyPhotoFilter(
    (state) => state.setFilterByPhotoDate
  );
  const filterByPhotoDate = UseMyPhotoFilter(
    (state) => state.filterByPhotoDate
  );
  const setFilterByUpVote = UseMyPhotoFilter(
    (state) => state.setFilterByUpVote
  );
  const filterByUpVote = UseMyPhotoFilter((state) => state.filterByUpVote);
  const handleFilterMyPhotoDate = (name, param) => {
    setFilterByPhotoDate(name, param);
  };
  const handleFilterMyUpVote = (name, param) => {
    setFilterByUpVote(name, param);
  };

  return (
    <div className="flex flex-col gap-2 justify-between items-center w-[300px] md:w-[350px] ">
      <span className="flex justify-center w-full font-normal bg-[#202225] rounded-t-lg p-2 ">
        Bộ lọc ảnh
      </span>
      <div className="flex flex-col  items-center gap-2 px-2 rounded-r-md p-4">
        <div className="flex flex-col  gap-2">
          {/* <div>
            <Menu as="div" className="relative inline-block text-left">
              <div>
                <MenuButton className="inline-flex items-center w-full justify-center gap-x-1.5 rounded-md  px-3 py-2 text-sm font-semibold text-[#eee] ">
                  <span className="font-normal">Ngày đăng:</span>{" "}
                  {filterByPhotoDate.name || ""}
                  <IoMdArrowDropdown />
                </MenuButton>
              </div>

              <MenuItems
                transition
                className="absolute right-0 z-10 mt-2 w-full origin-top rounded-md bg-[#1d1f22] shadow-lg ring-1 ring-black ring-opacity-5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
              >
                <div className="py-1">
                  {filterByDateList.map((item) => (
                    <MenuItem className="hover:cursor-pointer">
                      <div
                        onClick={() =>
                          handleFilterMyPhotoDate(item.name, item.param)
                        }
                        className="block px-4 py-2 text-sm text-[#eee] data-[focus]:bg-[#eee] data-[focus]:text-[#2f3136] transition-colors duration-200 ease-in-out"
                      >
                        {item.name}
                      </div>
                    </MenuItem>
                  ))}
                  <MenuItem className="hover:cursor-pointer">
                    <div
                      onClick={() => handleFilterMyPhotoDate("", "")}
                      className="block px-4 py-2 text-sm text-red-500 data-[focus]:bg-red-500 data-[focus]:text-[#eee] transition-colors duration-200 ease-in-out"
                    >
                      Xoá bộ lọc
                    </div>
                  </MenuItem>
                </div>
              </MenuItems>
            </Menu>
          </div> */}
          <div>
            <Menu as="div" className="relative inline-block text-left">
              <div>
                <MenuButton className="inline-flex items-center w-full justify-center gap-x-1.5 rounded-md  px-3 py-2 text-sm font-semibold text-[#eee] ">
                  <span className="font-normal">Lượt bình chọn:</span>{" "}
                  {filterByUpVote.name || ""}
                  <IoMdArrowDropdown />
                </MenuButton>
              </div>

              <MenuItems
                transition
                className="absolute right-0 z-10 mt-2 w-full origin-top rounded-md bg-[#1d1f22] shadow-lg ring-1 ring-black ring-opacity-5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
              >
                <div className="py-1">
                  {filterByUpVoteList.map((item) => (
                    <MenuItem className="hover:cursor-pointer">
                      <div
                        onClick={() =>
                          handleFilterMyUpVote(item.name, item.param)
                        }
                        className="block px-4 py-2 text-sm text-[#eee] data-[focus]:bg-[#eee] data-[focus]:text-[#2f3136] transition-colors duration-200 ease-in-out"
                      >
                        {item.name}
                      </div>
                    </MenuItem>
                  ))}
                  <MenuItem className="hover:cursor-pointer">
                    <div
                      onClick={() => handleFilterMyUpVote("", "")}
                      className="block px-4 py-2 text-sm text-red-500 data-[focus]:bg-red-500 data-[focus]:text-[#eee] transition-colors duration-200 ease-in-out"
                    >
                      Xoá bộ lọc
                    </div>
                  </MenuItem>
                </div>
              </MenuItems>
            </Menu>
          </div>
        </div>
        <div className="flex flex-col  gap-2 ">
          <div className="flex items-center p-[5px] rounded-md">
            <label class="inline-flex items-center cursor-pointer">
              <input
                id="watermarkCheckbox"
                type="checkbox"
                value=""
                class="sr-only peer"
                checked={isWatermarkChecked}
                onChange={handleWatermarkChange}
              />
              <div class="relative w-11 h-6 bg-gray-200 peer-focus:outline-none  rounded-full peer dark:bg-[#202225] peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[#6b7280]"></div>
              <span class="ms-3  font-normal text-[#eee] ">
                Ảnh có watermark
              </span>
            </label>
          </div>
          {/* <div className="flex items-center p-[5px] rounded-md">
            <label class="inline-flex items-center cursor-pointer">
              <input
                id="forSaleCheckbox"
                type="checkbox"
                value=""
                class="sr-only peer"
                checked={isForSaleChecked}
                onChange={handleForSaleChange}
              />
              <div class="relative w-11 h-6 bg-gray-200 peer-focus:outline-none  rounded-full peer dark:bg-[#202225] peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[#6b7280]"></div>
              <span class="ms-3 text-[#eee] font-normal ">Ảnh đang bán</span>
            </label>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default MyPhotoFilter;

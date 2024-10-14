import React from "react";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { IoMdArrowDropdown } from "react-icons/io";
import UseCategoryStore from "../../../states/UseCategoryStore";
const InsPhotoFilter = () => {
  const {
    isWatermarkChecked,
    isForSaleChecked,
    setIsWatermarkChecked,
    setIsForSaleChecked,
  } = UseCategoryStore();

  const handleWatermarkChange = (event) => {
    const isChecked = event.target.checked;
    setIsWatermarkChecked(isChecked);
  };

  const handleForSaleChange = (event) => {
    const isChecked = event.target.checked;
    setIsForSaleChecked(isChecked);
  };

  const setFilterByPhotoDate = UseCategoryStore(
    (state) => state.setFilterByPhotoDate
  );

  const filterByPhotoDate = UseCategoryStore(
    (state) => state.filterByPhotoDate
  );

  const setFilterByUpVote = UseCategoryStore(
    (state) => state.setFilterByUpVote
  );

  const filterByUpVote = UseCategoryStore((state) => state.filterByUpVote);
  const filterByDate = [
    {
      id: "f1",
      name: "Tăng dần",
      param: "asc",
    },
    {
      id: "f2",
      name: "Giảm dần",
      param: "desc",
    },
  ];

  const handleFilterByPhotoDate = (name, param) => {
    setFilterByPhotoDate(name, param);
  };
  const handleFilterByUpVote = (name, param) => {
    setFilterByUpVote(name, param);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 mx-3 items-center">
      {/* filter by create date menu */}
      <div>
        <Menu as="div" className="relative inline-block text-left">
          <div>
            <MenuButton className="inline-flex items-center w-full justify-center gap-x-1.5 rounded-md  px-3 py-2 text-sm font-semibold text-[#eee] shadow-sm ring-1 ring-inset ring-gray-300 ">
              <span className="font-normal">Ngày đăng:</span>{" "}
              {filterByPhotoDate.name || ""}
              <IoMdArrowDropdown />
            </MenuButton>
          </div>

          <MenuItems
            transition
            className="absolute right-0 z-10 mt-2 w-full origin-top-right rounded-md bg-[#2f3136] shadow-lg ring-1 ring-black ring-opacity-5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
          >
            <div className="py-1">
              {filterByDate.map((item) => (
                <MenuItem className="hover:cursor-pointer">
                  <div
                    onClick={() =>
                      handleFilterByPhotoDate(item.name, item.param)
                    }
                    className="block px-4 py-2 text-sm text-[#eee] data-[focus]:bg-[#eee] data-[focus]:text-[#2f3136] transition-colors duration-200 ease-in-out"
                  >
                    {item.name}
                  </div>
                </MenuItem>
              ))}
              <MenuItem className="hover:cursor-pointer">
                <div
                  onClick={() => handleFilterByPhotoDate("", "")}
                  className="block px-4 py-2 text-sm text-red-500 data-[focus]:bg-red-500 data-[focus]:text-[#eee] transition-colors duration-200 ease-in-out"
                >
                  Xoá bộ lọc
                </div>
              </MenuItem>
            </div>
          </MenuItems>
        </Menu>
      </div>

      {/* filter by up vote menu */}
      <div>
        <Menu as="div" className="relative inline-block text-left">
          <div>
            <MenuButton className="inline-flex items-center w-full justify-center gap-x-1.5 rounded-md  px-3 py-2 text-sm font-semibold text-[#eee] shadow-sm ring-1 ring-inset ring-gray-300 ">
              <span className="font-normal">Lượt bình chọn:</span>{" "}
              {filterByUpVote.name || ""}
              <IoMdArrowDropdown />
            </MenuButton>
          </div>

          <MenuItems
            transition
            className="absolute right-0 z-10 mt-2 w-full origin-top-right rounded-md bg-[#2f3136] shadow-lg ring-1 ring-black ring-opacity-5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
          >
            <div className="py-1">
              {filterByDate.map((item) => (
                <MenuItem className="hover:cursor-pointer">
                  <div
                    onClick={() => handleFilterByUpVote(item.name, item.param)}
                    className="block px-4 py-2 text-sm text-[#eee] data-[focus]:bg-[#eee] data-[focus]:text-[#2f3136] transition-colors duration-200 ease-in-out"
                  >
                    {item.name}
                  </div>
                </MenuItem>
              ))}
              <MenuItem className="hover:cursor-pointer">
                <div
                  onClick={() => handleFilterByUpVote("", "")}
                  className="block px-4 py-2 text-sm text-red-500 data-[focus]:bg-red-500 data-[focus]:text-[#eee] transition-colors duration-200 ease-in-out"
                >
                  Xoá bộ lọc
                </div>
              </MenuItem>
            </div>
          </MenuItems>
        </Menu>
      </div>
      <div className="flex items-center border p-[5px] rounded-md">
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
          <span class="ms-3 text-sm font-normal text-gray-900 dark:text-gray-300">
            Ảnh có watermark
          </span>
        </label>
      </div>
      <div className="flex items-center border p-[5px] rounded-md">
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
          <span class="ms-3 text-sm font-normal text-gray-900 dark:text-gray-300">
            Ảnh đang bán
          </span>
        </label>
      </div>
    </div>
  );
};

export default InsPhotoFilter;

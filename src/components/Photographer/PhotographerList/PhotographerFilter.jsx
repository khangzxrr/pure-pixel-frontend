import React from "react";
import UsePhotographerFilterStore from "../../../states/UsePhotographerFilterStore";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { IoMdArrowDropdown } from "react-icons/io";
const filterByPTGVote = [
  {
    id: "p1",
    name: "Tăng dần",
    param: "asc",
  },
  {
    id: "p2",
    name: "Giảm dần",
    param: "desc",
  },
];
const PhotographerFilter = () => {
  const setFilterByVote = UsePhotographerFilterStore(
    (state) => state.setFilterByVote
  );
  const filterByVote = UsePhotographerFilterStore(
    (state) => state.filterByVote
  );

  const handleFilterByVote = (name, param) => {
    setFilterByVote(name, param);
  };
  return (
    <div className="flex flex-col gap-1">
      <div>
        <Menu as="div" className="relative inline-block text-left">
          <div>
            <MenuButton className="inline-flex items-center w-full justify-center gap-x-1.5 rounded-md   py-2 text-sm font-semibold text-[#eee] ">
              <span className="font-normal text-[16px] text-[#a3a3a3]">
                Lượt bình chọn:
              </span>{" "}
              <div className="text-[16px]">{filterByVote.name || ""}</div>
              <IoMdArrowDropdown />
            </MenuButton>
          </div>

          <MenuItems
            transition
            className="absolute right-0 z-10 mt-2 w-full origin-top rounded-md bg-[#202225] shadow-lg ring-1 ring-black ring-opacity-5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
          >
            <div className="py-1">
              {filterByPTGVote.map((item) => (
                <MenuItem key={item.id} className="hover:cursor-pointer">
                  <div
                    onClick={() => handleFilterByVote(item.name, item.param)}
                    className="block px-4 py-2 text-sm text-[#eee] data-[focus]:bg-[#eee] data-[focus]:text-[#2f3136] transition-colors duration-200 ease-in-out"
                  >
                    {item.name}
                  </div>
                </MenuItem>
              ))}
              <MenuItem className="hover:cursor-pointer">
                <div
                  onClick={() => handleFilterByVote("", "")}
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
  );
};

export default PhotographerFilter;

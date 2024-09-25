import React from "react";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { IoOptionsSharp } from "react-icons/io5";
import { Link } from "react-router-dom";
import InspirationTrendItem from "../Inspiration/InspirationSide/InspirationTrendItem";
const Categories = () => {
  return (
    <Menu as="div" className="relative inline-block text-left">
      <div className="text-[#eee] ">
        <MenuButton className="inline-flex w-full items-center justify-center gap-x-1.5 rounded-md text-md px-3 py-[6px]  font-semibold  ">
          <div className="hidden xl:block">Danh mục</div>
          <IoOptionsSharp aria-hidden="true" className="-mr-1 h-6 w-6 " />
        </MenuButton>
      </div>
      <MenuItems
        transition
        className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-gray-500 shadow-lg ring-1 ring-black ring-opacity-5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
      >
        <div className="py-1 text-[#eee] bg-[#202225]">
          {InspirationTrendItem.map((item) => (
            <MenuItem key={item.id}>
              <Link
                to={"#"}
                className="block px-4 py-2 text-sm  data-[focus]: data-[focus]:text-[#eee] data-[focus]:bg-[#36393f]"
              >
                {item.title}
              </Link>
            </MenuItem>
          ))}
        </div>
      </MenuItems>
    </Menu>
  );
};

export default Categories;

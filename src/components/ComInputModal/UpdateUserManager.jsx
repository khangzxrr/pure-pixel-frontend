import React from "react";
import { SlOptions } from "react-icons/sl";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { FaAngleDown } from "react-icons/fa6";
import { useQuery } from "@tanstack/react-query";
import LoadingSpinner from "./../LoadingSpinner/LoadingSpinner";
import AdminApi from "../../apis/AdminApi";
const UpdateUserManager = ({ onClose, account }) => {
  const userId = account?.id;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["user-profile-manager", userId],
    queryFn: () => AdminApi.getUserById(userId),
  });

  if (isLoading)
    return (
      <div className="flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );

  const handleUpdateUser = () => {
    onClose();
  };

  return (
    <div className="flex flex-col text-[#eee] gap-3 ">
      <div className="flex items-center gap-5 justify-between">
        <div className="flex flex-col w-full gap-2 ">
          <div>Tên:</div>
          <input
            type="text"
            className="p-1 bg-[#202225] outline-none rounded-sm w-full"
          />
        </div>
        <div className="flex w-full flex-col gap-2">
          <div>Số điện thoại:</div>
          <input
            type="number"
            className="p-1 bg-[#202225] outline-none rounded-sm"
          />
        </div>
      </div>
      <div className="flex items-center gap-5 justify-between">
        <div className="flex flex-col w-full gap-2 ">
          <div>Địa chỉ:</div>
          <input
            type="text"
            className="p-1 bg-[#202225] outline-none rounded-sm"
          />
        </div>
        <div className="flex flex-col w-full gap-2">
          <div>Địa chỉ email:</div>
          <input
            type="email"
            className="p-1 bg-[#202225] outline-none rounded-sm"
          />
        </div>
      </div>
      <label class="inline-flex gap-2 items-center cursor-pointer">
        <span class=" text-sm font-medium text-gray-900 dark:text-gray-300">
          Kích hoạt/Hủy kích hoạt tài khoản
        </span>
        <input type="checkbox" value="" class="sr-only peer" />
        <div class="relative w-11 h-6 bg-gray-200  rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
      </label>
      <div className="flex items-center gap-2">
        Quyền:
        <Menu as="div" className="relative inline-block text-left">
          <div>
            <MenuButton className="inline-flex items-center bg-[#374151] w-full justify-center gap-x-1.5 rounded-md px-3 py-2 text-sm font-semibold text-gray-90 ">
              Khách hàng
              <FaAngleDown />
            </MenuButton>
          </div>

          <MenuItems
            transition
            className="absolute right-0 z-10 mt-2 w-32 origin-top-right rounded-md bg-[#374151]  transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
          >
            <div className="py-1">
              <MenuItem>
                <div className="block px-4 py-2 text-sm text-[#eee] hover:cursor-pointer data-[focus]:bg-gray-100 data-[focus]:text-gray-900 data-[focus]:outline-none">
                  Quản lí
                </div>
              </MenuItem>
              <MenuItem>
                <div className="block px-4 py-2 text-sm text-[#eee] hover:cursor-pointer data-[focus]:bg-gray-100 data-[focus]:text-gray-900 data-[focus]:outline-none">
                  Nhiếp ảnh gia
                </div>
              </MenuItem>
              <MenuItem>
                <div className="block px-4 py-2 text-sm text-[#eee] hover:cursor-pointer data-[focus]:bg-gray-100 data-[focus]:text-gray-900 data-[focus]:outline-none">
                  Khách hàng
                </div>
              </MenuItem>
            </div>
          </MenuItems>
        </Menu>
      </div>
      <div className="flex flex-col gap-2">
        <div>Tiểu sử:</div>
        <textarea
          rows="4"
          type="text"
          className="p-1 bg-[#202225] outline-none rounded-sm w-full"
        />
      </div>
      <div className="flex flex-col items-center">
        <button
          onClick={() => handleUpdateUser()}
          className=" w-full text-[#202225] font-bold bg-[#eee] rounded-md px-5 py-1 hover:opacity-80 transition-opacity duration-200"
        >
          Lưu chỉnh sửa
        </button>
      </div>
    </div>
  );
};

export default UpdateUserManager;

import React, { useEffect, useState } from "react";
import { SlOptions } from "react-icons/sl";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { FaAngleDown } from "react-icons/fa6";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationApi } from "../../Notification/Notification";
import AdminApi from "./../../apis/AdminApi";
import LoadingOval from "../LoadingSpinner/LoadingOval";
const UpdateUserDetail = ({ userDetail, onClose, loading }) => {
  const queryClient = useQueryClient();
  const [isLoadingButton, setIsLoadingButton] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [email, setEmail] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [role, setRole] = useState("Không xác định");
  const [quote, setQuote] = useState("");

  // Đồng bộ state với userDetail
  useEffect(() => {
    setName(userDetail?.name || "");
    setPhone(userDetail?.phonenumber || "");
    setLocation(userDetail?.location || "");
    setEmail(userDetail?.mail || "");
    setIsActive(userDetail?.enabled || false);
    setRole(
      userDetail?.roles?.includes("photographer")
        ? "nhiếp ảnh gia"
        : userDetail?.roles?.includes("purepixel-admin")
        ? "quản trị viên"
        : userDetail?.roles?.includes("customer")
        ? "khách hàng"
        : userDetail?.roles?.includes("manager")
        ? "quản lý"
        : "không xác định"
    );
    setQuote(userDetail?.quote || "");
  }, [userDetail]);

  const updateUser = useMutation({
    mutationFn: (updateBody) => AdminApi.updateUser(userDetail.id, updateBody),
  });

  const handleUpdateUser = () => {
    setIsLoadingButton(true);
    const updateBody = {
      enabled: isActive,
    };
    if (name) updateBody.name = name;
    if (email) updateBody.mail = email;
    if (phone) updateBody.phonenumber = phone;
    if (quote) updateBody.quote = quote;
    if (location) updateBody.location = location;
    updateUser.mutate(updateBody, {
      onSuccess: () => {
        notificationApi(
          "success",
          "Cập nhật thành công",
          "Cập nhật tài khoản thành công"
        );
        loading();
        queryClient.invalidateQueries({ queryKey: ["users-manager"] });
        setIsLoadingButton(false);
        onClose();
      },
      onError: (error) => {
        if (error.response.data.message[0].includes("phonenumber must match")) {
          notificationApi(
            "error",
            "Cập nhật thất bại",
            "Số điện thoại không đúng định dạng"
          );
        } else {
          notificationApi(
            "error",
            "Cập nhật thất bại",
            error.response.data.message[0]
          );
        }

        queryClient.invalidateQueries({ queryKey: ["users-manager"] });
        setIsLoadingButton(false);
      },
    });
  };

  return (
    <div className="flex flex-col text-[#eee] gap-3 ">
      <div className="flex items-center gap-5 justify-between">
        <div className="flex flex-col w-full gap-2 ">
          <div>Tên:</div>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="p-1 bg-[#202225] outline-none rounded-sm w-full"
          />
        </div>
        <div className="flex w-full flex-col gap-2">
          <div>Số điện thoại:</div>
          <input
            type="number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="p-1 bg-[#202225] outline-none rounded-sm"
          />
        </div>
      </div>
      <div className="flex items-center gap-5 justify-between">
        <div className="flex flex-col w-full gap-2 ">
          <div>Địa chỉ:</div>
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            type="text"
            className="p-1 bg-[#202225] outline-none rounded-sm"
          />
        </div>
        <div className="flex flex-col w-full gap-2">
          <div>Địa chỉ email:</div>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            className="p-1 bg-[#202225] outline-none rounded-sm"
          />
        </div>
      </div>
      <label class="inline-flex gap-2 items-center cursor-pointer">
        <span class=" text-sm font-medium text-gray-900 dark:text-gray-300">
          Kích hoạt/Hủy kích hoạt tài khoản
        </span>
        <input
          type="checkbox"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          class="sr-only peer"
        />
        <div class="relative w-11 h-6 bg-gray-200  rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
      </label>
      <div className="flex items-center gap-2">
        Quyền: <span className="font-bold">{role || ""}</span>
        {/* <Menu as="div" className="relative inline-block text-left">
          <div>
            <MenuButton className="inline-flex items-center bg-[#374151] w-full justify-center gap-x-1.5 rounded-md px-3 py-2 text-sm font-semibold text-gray-90 ">
              {role}
              <FaAngleDown />
            </MenuButton>
          </div>

          <MenuItems
            transition
            className="absolute right-0 z-10 mt-2 w-32 origin-top-right rounded-md bg-[#374151]  transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
          >
            <div className="py-1">
              <MenuItem>
                <div
                  onClick={() => setRole("quản lý")}
                  className="block px-4 py-2 text-sm text-[#eee] hover:cursor-pointer data-[focus]:bg-gray-100 data-[focus]:text-gray-900 data-[focus]:outline-none"
                >
                  Quản lý
                </div>
              </MenuItem>
              <MenuItem>
                <div
                  onClick={() => setRole("nhiếp ảnh gia")}
                  className="block px-4 py-2 text-sm text-[#eee] hover:cursor-pointer data-[focus]:bg-gray-100 data-[focus]:text-gray-900 data-[focus]:outline-none"
                >
                  Nhiếp ảnh gia
                </div>
              </MenuItem>
              <MenuItem>
                <div
                  onClick={() => setRole("khách hàng")}
                  className="block px-4 py-2 text-sm text-[#eee] hover:cursor-pointer data-[focus]:bg-gray-100 data-[focus]:text-gray-900 data-[focus]:outline-none"
                >
                  Khách hàng
                </div>
              </MenuItem>
            </div>
          </MenuItems>
        </Menu> */}
      </div>
      <div className="flex flex-col gap-2">
        <div>Tiểu sử:</div>
        <textarea
          value={quote}
          onChange={(e) => setQuote(e.target.value)}
          rows="4"
          type="text"
          className="p-1 bg-[#202225] outline-none rounded-sm w-full"
        />
      </div>
      <div className="flex flex-col items-center">
        <button
          onClick={() => handleUpdateUser()}
          className=" w-full text-[#202225] flex justify-center font-bold bg-[#eee] rounded-md px-5 py-1 hover:opacity-80 transition-opacity duration-200"
        >
          {isLoadingButton ? (
            <LoadingOval
              size={"20"}
              color={"#202225"}
              strongWidth={7}
              secondaryColor={"#eee"}
            />
          ) : (
            "Lưu chỉnh sửa"
          )}
        </button>
      </div>
    </div>
  );
};

export default UpdateUserDetail;

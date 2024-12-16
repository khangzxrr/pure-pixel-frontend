import React from "react";
import { FormatDate } from "./../../utils/FormatDate";
import { FaCamera } from "react-icons/fa6";
import { IoLocationOutline, IoMailOutline } from "react-icons/io5";
import { FiPhone } from "react-icons/fi";
const AccountDetail = ({ account, onClose }) => {
  return (
    <div className="text-[#eee] relative">
      <div className="flex flex-col h-[500px] relative">
        <div className="h-full overflow-hidden">
          <img
            src={account?.cover}
            alt="Cover"
            className="size-full object-cover"
          />
        </div>

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-full -translate-y-1/2 bg-black bg-opacity-50 backdrop-blur-md  shadow-lg   p-6 text-white">
          <div className="flex justify-center">
            <div className="size-24 bg-[#eee] rounded-full overflow-hidden ">
              <img
                src={account?.avatar}
                alt="Avatar"
                className="size-full object-cover"
              />
            </div>
          </div>
          <div className="flex justify-center text-lg items-center flex-col mt-1">
            <h2 className="flex items-center gap-1 font-semibold text-center ">
              <span className="text-2xl ">{account?.name}</span>
              {account?.roles[0] === "photographer" ? (
                <div className="bg-yellow-500 p-[5px] rounded-full">
                  <FaCamera className="flex items-center text-[10px] text-[#202225]" />
                </div>
              ) : null}
            </h2>
            {account?.location && (
              <p className="flex items-center gap-1">
                <IoLocationOutline />
                {account?.location}
              </p>
            )}
            {account?.mail && (
              <p className="flex items-center gap-1">
                <IoMailOutline />
                {account?.mail}
              </p>
            )}
            {account?.phonenumber && (
              <p className="flex items-center gap-1">
                <FiPhone />
                {account?.phonenumber}
              </p>
            )}

            <p>Ngày tạo: {FormatDate(account?.createdAt)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountDetail;

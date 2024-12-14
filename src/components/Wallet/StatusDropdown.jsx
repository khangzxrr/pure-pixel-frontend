import { Dropdown } from "antd";
import React from "react";
const getStatusLabel = (status) => {
  const baseClass = "rounded transition-colors duration-300 ease-in-out w-full";
  switch (status) {
    case "":
      return (
        <div className={`${baseClass} text-white `}>
          <p className="text-sm">Tất cả</p>
        </div>
      );
    case "SUCCESS":
      return (
        <div className={`${baseClass} text-green-400 `}>
          <p className="text-sm">✓ Thành công</p>
        </div>
      );
    case "PENDING":
      return (
        <div className={`${baseClass} text-yellow-500 `}>
          <p className="text-sm">◔ Đang chờ</p>
        </div>
      );
    case "CANCEL":
      return (
        <div className={`${baseClass} text-red-500`}>
          <p className="text-sm">x Bị hủy</p>
        </div>
      );
    case "FAILED":
      return (
        <div className={`${baseClass} text-red-500`}>
          <p className="text-sm">x Thất bại</p>
        </div>
      );
    case "EXPIRED":
      return (
        <div className={`${baseClass} text-gray-500`}>
          <p className="text-sm">Hết hạn</p>
        </div>
      );
    default:
      return (
        <div className={`${baseClass} text-gray-400 `}>
          <p className="text-sm">Không xác định</p>
        </div>
      );
  }
};

export default function StatusDropdown({ statuses, setStatuses, setPage }) {
  const filterStatus = [
    {
      key: "1",
      label: (
        <div
          className={`${
            statuses === ""
              ? "hover:bg-blue-600 bg-blue-500 text-white"
              : "hover:bg-blue-500 text-blue-600 hover:text-white"
          } py-1 px-2  rounded transition-colors duration-300 ease-in-out w-full`}
          onClick={() => {
            setStatuses("");
            setPage(1);
          }}
        >
          <p className="text-sm">Tất cả</p>
        </div>
      ),
    },
    {
      key: "2",
      label: (
        <div
          className={`${
            statuses === "SUCCESS"
              ? "hover:bg-green-600 bg-green-500 text-white"
              : "hover:bg-green-500 text-green-600 hover:text-white"
          } py-1 px-2  rounded transition-colors duration-300 ease-in-out w-full`}
          onClick={() => {
            setStatuses("SUCCESS");
            setPage(1);
          }}
        >
          <p className="text-sm">✓ Thành công</p>
        </div>
      ),
    },
    {
      key: "3",
      label: (
        <div
          className={`${
            statuses === "PENDING"
              ? "hover:bg-yellow-600 bg-yellow-500 text-white"
              : "hover:bg-yellow-500 text-yellow-600 hover:text-white"
          } py-1 px-2  rounded transition-colors duration-300 ease-in-out w-full`}
          onClick={() => {
            setStatuses("PENDING");
            setPage(1);
          }}
        >
          <p>◔ Đang chờ</p>
        </div>
      ),
    },
    {
      key: "4",
      label: (
        <div
          className={`${
            statuses === "CANCEL"
              ? "hover:bg-red-600 bg-red-500 text-white"
              : "hover:bg-red-500 text-red-600 hover:text-white"
          } py-1 px-2  rounded transition-colors duration-300 ease-in-out w-full`}
          onClick={() => {
            setStatuses("CANCEL");
            setPage(1);
          }}
        >
          <p>x Bị hủy</p>
        </div>
      ),
    },
    {
      key: "5",
      label: (
        <div
          className={`${
            statuses === "FAILED"
              ? "hover:bg-gray-600 bg-gray-500 text-white"
              : "hover:bg-gray-500 text-gray-600 hover:text-white"
          } py-1 px-2  rounded transition-colors duration-300 ease-in-out w-full`}
          onClick={() => {
            setStatuses("FAILED");
            setPage(1);
          }}
        >
          <p>Thất bại</p>
        </div>
      ),
    },
    {
      key: "5",
      label: (
        <div
          className={`${
            statuses === "EXPIRED"
              ? "hover:bg-gray-600 bg-gray-500 text-white"
              : "hover:bg-gray-500 text-gray-600 hover:text-white"
          } py-1 px-2  rounded transition-colors duration-300 ease-in-out w-full`}
          onClick={() => {
            setStatuses("EXPIRED");
            setPage(1);
          }}
        >
          <p>Hết hạn</p>
        </div>
      ),
    },
  ];
  return (
    <div className="flex flex-col lg:flex-row lg:justify-between gap-2">
      <p className="py-1">Trạng thái</p>
      <Dropdown
        className="hover:cursor-pointer"
        trigger={["click"]}
        menu={{ items: filterStatus }}
      >
        <div className="border-[1px] px-2 py-1 rounded-md hover:bg-opacity-70 bg-[#1d1f22]">
          {getStatusLabel(statuses)}
        </div>
      </Dropdown>
    </div>
  );
}

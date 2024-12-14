import { Dropdown } from "antd";
import React from "react";
// Helper function to get the label
const getTypeLabel = (type) => {
  switch (type) {
    case "":
      return <p className="text-white">Tất cả</p>;
    case "UPGRADE_TO_PHOTOGRAPHER":
      return <p className="text-blue-500 font-bold">Nâng cấp tài khoản</p>;
    case "DEPOSIT":
      return <p className="text-green-500 font-bold">Nạp tiền</p>;
    case "IMAGE_BUY":
      return <p className="text-yellow-500 font-bold">Mua ảnh</p>;
    case "IMAGE_SELL":
      return <p className="text-orange-500 font-bold">Bán ảnh</p>;
    case "WITHDRAWAL":
      return <p className="text-red-500 font-bold">Rút tiền</p>;
    case "REFUND_FROM_BUY_IMAGE":
      return <p className="text-purple-500 font-bold">Hoàn tiền</p>;
    default:
      return <p className="text-gray-500 font-italic">Không xác định</p>; // Fallback for undefined types
  }
};
export default function TypesDropdown({ types, setTypes, setPage }) {
  const filterTypes = [
    {
      key: "1",
      label: (
        <div
          className={`${
            types === ""
              ? "bg-gray-500 text-white"
              : "hover:bg-gray-400 text-gray-600 hover:text-white"
          } py-1 px-2 -m-1 rounded transition-colors duration-300 ease-in-out w-full`}
          onClick={() => {
            setTypes("");
            setPage(1);
          }}
        >
          Xem tất cả
        </div>
      ),
    },
    {
      key: "2",
      label: (
        <div
          className={`${
            types === "UPGRADE_TO_PHOTOGRAPHER"
              ? "bg-blue-500 text-white"
              : "hover:bg-blue-400 text-blue-600 hover:text-white"
          } py-1 px-2 -m-1 rounded transition-colors duration-300 ease-in-out w-full`}
          onClick={() => {
            setTypes("UPGRADE_TO_PHOTOGRAPHER");
            setPage(1);
          }}
        >
          <p className="text-sm">Nâng cấp tài khoản</p>
        </div>
      ),
    },
    {
      key: "3",
      label: (
        <div
          className={`${
            types === "DEPOSIT"
              ? "bg-green-500 text-white"
              : "hover:bg-green-400 text-green-600 hover:text-white"
          } py-1 px-2 rounded transition-colors duration-300 ease-in-out w-full`}
          onClick={() => {
            setTypes("DEPOSIT");
            setPage(1);
          }}
        >
          <p className="text-sm">Nạp tiền</p>
        </div>
      ),
    },
    {
      key: "4",
      label: (
        <div
          className={`${
            types === "IMAGE_BUY"
              ? "bg-yellow-500 text-white"
              : "hover:bg-yellow-400 text-yellow-600 hover:text-white"
          } py-1 px-2 rounded transition-colors duration-300 ease-in-out w-full`}
          onClick={() => {
            setTypes("IMAGE_BUY");
            setPage(1);
          }}
        >
          <p className="text-sm">Mua ảnh</p>
        </div>
      ),
    },
    {
      key: "5",
      label: (
        <div
          className={`${
            types === "IMAGE_SELL"
              ? "bg-orange-500 text-white"
              : "hover:bg-orange-400 text-orange-600 hover:text-white"
          } py-1 px-2 rounded transition-colors duration-300 ease-in-out w-full`}
          onClick={() => {
            setTypes("IMAGE_SELL");
            setPage(1);
          }}
        >
          <p className="text-sm">Bán ảnh</p>
        </div>
      ),
    },
    {
      key: "6",
      label: (
        <div
          className={`${
            types === "WITHDRAWAL"
              ? "bg-red-500 text-white"
              : "hover:bg-red-400 text-red-600 hover:text-white"
          } py-1 px-2 rounded transition-colors duration-300 ease-in-out w-full`}
          onClick={() => {
            setTypes("WITHDRAWAL");
            setPage(1);
          }}
        >
          <p className="text-sm">Rút tiền</p>
        </div>
      ),
    },
    {
      key: "7",
      label: (
        <div
          className={`${
            types === "REFUND_FROM_BUY_IMAGE"
              ? "bg-purple-500 text-white"
              : "hover:bg-purple-400 text-purple-600 hover:text-white"
          } py-1 px-2 rounded transition-colors duration-300 ease-in-out w-full`}
          onClick={() => {
            setTypes("REFUND_FROM_BUY_IMAGE");
            setPage(1);
          }}
        >
          <p className="text-sm">Hoàn tiền</p>
        </div>
      ),
      // value: "REFUND_FROM_BUY_IMAGE",
    },
  ];
  return (
    <div className="flex flex-col lg:flex-row lg:justify-between gap-2">
      <p className=" px-2 py-1">Trạng thái</p>
      <Dropdown
        className="hover:cursor-pointer"
        trigger={["click"]}
        menu={{ items: filterTypes }}
      >
        <div className="border-[1px] px-2 py-1 rounded-md hover:bg-opacity-70 bg-[#1d1f22]">
          {getTypeLabel(types)}
        </div>
      </Dropdown>
    </div>
  );
}

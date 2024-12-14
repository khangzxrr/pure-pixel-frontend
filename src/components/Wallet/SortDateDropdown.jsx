import { Dropdown, Tooltip } from "antd";
import { CaretDownOutlined, CaretUpOutlined } from "@ant-design/icons";
import React from "react";

export default function SortDateDropdown({
  orderByCreatedAt,
  setOrderByCreatedAt,
  handleSortOptionChange, // Optional: Function for handling dropdown option selection
}) {
  // Dropdown options
  const sortOptions = [
    {
      key: "1",
      label: (
        <div
          className={`${
            orderByCreatedAt === "desc"
              ? "hover:bg-gray-600 bg-gray-500 text-white"
              : "hover:bg-gray-500 text-gray-600 hover:text-white"
          } cursor-pointer px-2 py-1 rounded`}
          onClick={() => setOrderByCreatedAt("asc")}
        >
          Sắp xếp theo cũ nhất
        </div>
      ),
    },
    {
      key: "2",
      label: (
        <div
          className="cursor-pointer px-2 py-1 hover:bg-gray-200 rounded"
          onClick={() => setOrderByCreatedAt("desc")}
        >
          Sắp xếp theo mới nhất
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col lg:flex-row lg:justify-between gap-2">
      <p className="py-1">Ngày cập nhật</p>

      <Dropdown
        menu={{ items: sortOptions }}
        trigger={["click"]}
        className="hover:cursor-pointer"
      >
        <div className="cursor-pointer font-light border-[1px] px-2 py-1 rounded-md bg-[#1d1f22] hover:bg-opacity-70 flex items-center">
          {orderByCreatedAt === "desc" ? (
            <Tooltip title="Sắp xếp theo cũ nhất">Từ mới đến cũ</Tooltip>
          ) : (
            <Tooltip title="Sắp xếp theo mới nhất">Từ cũ đến mới</Tooltip>
          )}
        </div>
      </Dropdown>
    </div>
  );
}

import { Tooltip } from "antd";
import React, { useState } from "react";
import { EyeInvisibleOutlined, EyeOutlined } from "@ant-design/icons";

export default function ComCard({ title, value, icon, onClick, isSelected }) {
  const [isBalanceVisible, setIsBalanceVisible] = useState(false); // State for visibility

  function formatCurrency(number) {
    // Sử dụng hàm toLocaleString() để định dạng số thành chuỗi với ngăn cách hàng nghìn và mặc định là USD.
    if (typeof number === "number") {
      return number.toLocaleString("vi-VN", {
        style: "currency",
        currency: "VND",
      });
    }
  }
  const toggleBalanceVisibility = () => {
    setIsBalanceVisible(!isBalanceVisible);
  };

  return (
    <div
      onClick={onClick}
      className={`  col-span-1 bg-[#2a2c32] shadow rounded-lg p-3 flex flex-col`}
    >
      <p className="text-lg text-[#b9b3b3]">{title}</p>
      <div className="flex items-center justify-between w-full cursor-pointer text-[#dddddd] hover:text-white p-2">
        <div className="w-full flex flex-row justify-between">
          <div className="w-5/6">
            {value
              ? Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(value)
              : 0}
          </div>
        </div>
      </div>
    </div>
  );
}

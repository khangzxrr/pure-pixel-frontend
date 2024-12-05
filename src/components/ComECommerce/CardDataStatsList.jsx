import React from "react";
import CardDataStats from "./CardDataStats";
import { FiImage, FiPackage, FiUsers } from "react-icons/fi";
import { MdAttachMoney } from "react-icons/md";
import { FaArrowDown, FaArrowUp } from "react-icons/fa6";

const CardDataStatsList = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 px-5">
      <CardDataStats
        icon={<FiUsers className="text-xl" />}
        dataCount={"10,000"}
        label="Tổng số người đăng ký"
        percent={"26.8"}
        iconPercent={<FaArrowUp />}
        colorPercent={"text-green-500"}
        link={"total-users"}
      />
      <CardDataStats
        icon={<FiImage className="text-xl" />}
        dataCount={"2,000"}
        label={"Tổng số ảnh"}
        percent={"2.8"}
        iconPercent={<FaArrowDown />}
        colorPercent={"text-red-500"}
      />
      <CardDataStats
        icon={<FiPackage className="text-xl" />}
        dataCount={"200"}
        label={"Tổng số gói dịch vụ"}
        percent={"30.6"}
        iconPercent={<FaArrowUp />}
        colorPercent={"text-green-500"}
      />
      <CardDataStats
        icon={<MdAttachMoney className="text-xl" />}
        dataCount={"20,000,000 VNĐ"}
        label={"Tổng doanh thu"}
        percent={"50.7"}
        iconPercent={<FaArrowUp />}
        colorPercent={"text-green-500"}
      />
    </div>
  );
};

export default CardDataStatsList;

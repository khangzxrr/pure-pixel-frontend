import React from "react";
import CardDataStats from "../components/ComECommerce/CardDataStats";
import { FiImage, FiPackage, FiUsers } from "react-icons/fi";
import { FaArrowDown, FaArrowUp } from "react-icons/fa6";
import { MdAttachMoney } from "react-icons/md";
import CardDataStatsList from "../components/ComECommerce/CardDataStatsList";
import ChartDashboard from "../components/ComECommerce/ChartDashboard";

const ECommerceLayout = () => {
  return (
    <div className="flex flex-col gap-8 ">
      <CardDataStatsList />
      <ChartDashboard />
    </div>
  );
};

export default ECommerceLayout;

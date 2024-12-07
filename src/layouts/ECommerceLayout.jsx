import React from "react";
import CardDataStats from "../components/ComECommerce/CardDataStats";
import { FiImage, FiPackage, FiUsers } from "react-icons/fi";
import { FaArrowDown, FaArrowUp } from "react-icons/fa6";
import { MdAttachMoney } from "react-icons/md";
import CardDataStatsList from "../components/ComECommerce/CardDataStatsList";
import ChartDashboard from "../components/ComECommerce/ChartDashboard";
import Table from "../components/ComECommerce/Table";
import { useQuery } from "@tanstack/react-query";
import AdminApi from "../apis/AdminApi";
import LoadingOval from "../components/LoadingSpinner/LoadingOval";

const ECommerceLayout = () => {
  const toDate = new Date();
  const fromDate = new Date(toDate.getTime() - 7 * 24 * 60 * 60 * 1000);

  const fromDateCustomize = "2024-10-01T01:30:14.761+07:00";
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () =>
      AdminApi.getDashboard(fromDateCustomize, toDate.toISOString()),
  });

  const {
    data: TopSeller,
    isLoading: isLoadingTop,
    isError: isErrorTop,
    error: errorTop,
  } = useQuery({
    queryKey: ["top-seller-dashboard"],
    queryFn: () =>
      AdminApi.getTopSellerDashboard(fromDateCustomize, toDate.toISOString()),
  });

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-[200px]">
        <LoadingOval />
      </div>
    );

  if (isLoadingTop)
    return (
      <div className="flex items-center justify-center h-[200px]">
        <LoadingOval />
      </div>
    );

  return (
    <div className="flex flex-col gap-8 ">
      <CardDataStatsList data={data} />
      <ChartDashboard dashBoardData={data} />
      <Table dataTopSeller={TopSeller} />
    </div>
  );
};

export default ECommerceLayout;

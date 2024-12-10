import React from "react";
import CardDataStatsList from "../components/ComECommerce/CardDataStatsList";
import ChartDashboard from "../components/ComECommerce/ChartDashboard";
import Table from "../components/ComECommerce/Table";
import { useQuery } from "@tanstack/react-query";
import AdminApi from "../apis/AdminApi";
import LoadingOval from "../components/LoadingSpinner/LoadingOval";
import { ConfigProvider, DatePicker, Space } from "antd";
import vi_VN from "antd/es/locale/vi_VN";
import "../components/ComECommerce/ECommerceDatePickerStyle.css";
import UseECommerceStore from "../states/UseECommerceStore";
import dayjs from "dayjs";
import TableCameraList from "../components/ComECommerce/TableCameraList";
import CameraApi from "../apis/CameraApi";
import ChartDashboardRevenue from "../components/ComECommerce/ChartDashboardRevenue";
import ChartTotalUsedCameraByBrand from "../components/ComECommerce/ChartTotalUsedCameraByBrand";
const { RangePicker } = DatePicker;

const ECommerceLayout = () => {
  const { fromDate, toDate, setFromDateState, setToDateState } =
    UseECommerceStore();
  const [arrayDatePicker, setArrayDatePicker] = React.useState([
    fromDate,
    toDate,
  ]);

  // const toDate = new Date();
  // const fromDate = new Date(toDate.getTime() - 7 * 24 * 60 * 60 * 1000);

  // const fromDateCustomize = "2024-10-01T01:30:14.761+07:00";
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["dashboard", fromDate, toDate],
    queryFn: () =>
      AdminApi.getDashboard(fromDate.toISOString(), toDate.toISOString()),
  });

  const {
    data: TopSeller,
    isLoading: isLoadingTop,
    isError: isErrorTop,
    error: errorTop,
  } = useQuery({
    queryKey: ["top-seller-dashboard", fromDate, toDate],
    queryFn: () =>
      AdminApi.getTopSellerDashboard(
        fromDate.toISOString(),
        toDate.toISOString()
      ),
  });

  const {
    data: TopCamera,
    isLoading: isLoadingTopCamera,
    isError: isErrorTopCamera,
    error: errorTopCamera,
  } = useQuery({
    queryKey: ["top-camera-dashboard", fromDate, toDate],
    queryFn: () => CameraApi.getTopCameras(10),
  });

  const handleOnClickDatePicker = () => {
    setFromDateState(arrayDatePicker[0]);
    setToDateState(arrayDatePicker[1]);
  };
  return (
    <div className="flex flex-col gap-2">
      <div className=" flex justify-end items-center gap-2 mr-5">
        <div className="text-[#eee]">Thống kê từ ngày: </div>
        <ConfigProvider
          locale={vi_VN}
          theme={{
            components: {
              DatePicker: {
                activeBorderColor: "#e0e0e0",
              },
            },
          }}
        >
          <RangePicker
            className="custom-range-picker font-light p-2"
            defaultValue={[dayjs(fromDate), dayjs(toDate)]}
            style={{ backgroundColor: "#292b2f", outline: "none" }}
            onChange={(value) => {
              const [startDate, endDate] = value;
              setArrayDatePicker([
                new Date(startDate.$d),
                new Date(endDate.$d),
              ]);
            }}
          />
        </ConfigProvider>
        <button
          onClick={() => handleOnClickDatePicker()}
          className="bg-[#eee] font-semibold text-[#202225] px-2 py-1 rounded-md"
        >
          Xác nhận
        </button>
      </div>
      {(isLoading || isLoadingTop || isLoadingTopCamera) && (
        <div className="flex items-center justify-center h-[200px]">
          <LoadingOval />
        </div>
      )}
      {!isLoading && !isLoadingTop && !isLoadingTopCamera && (
        <div className="flex flex-col gap-8 ">
          <CardDataStatsList data={data} />
          <ChartDashboard dashBoardData={data} />
          <Table dataTopSeller={TopSeller} />
          <div className="grid grid-cols-1 md:grid-cols-8 gap-8 px-5">
            <div className="col-span-5">
              <TableCameraList dataCamera={TopCamera} />
            </div>

            <div className="col-span-3">
              <div className="bg-[#32353b]  rounded-sm">
                <ChartTotalUsedCameraByBrand />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ECommerceLayout;

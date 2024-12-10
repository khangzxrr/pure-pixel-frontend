import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import UseTotalCameraUsedByUserStore from "../../states/UseTotalCameraUsedByUserStore";
import { useQuery } from "@tanstack/react-query";
import CameraApi from "../../apis/CameraApi";
import LoadingOval from "../LoadingSpinner/LoadingOval";

const ChartTotalUsedCameraByBrand = () => {
  const [series, setSeries] = useState([]);
  const [itemsName, setItemsName] = useState([]);
  const idCameraByBrand = UseTotalCameraUsedByUserStore(
    (state) => state.idCameraByBrand
  );

  const nameCameraByBrand = UseTotalCameraUsedByUserStore(
    (state) => state.nameCameraByBrand
  );

  // Màu sáng cố định
  const brightColors = [
    "#FFD700", // Vàng
    "#FF7F50", // Cam
    "#00FA9A", // Xanh nhạt
    "#7B68EE", // Tím nhạt
    "#FF69B4", // Hồng
    "#00CED1", // Xanh dương nhạt
    "#FF4500", // Đỏ cam
    "#1E90FF", // Xanh dương sáng
    "#32CD32", // Xanh lá sáng
    "#FF6347", // Cam đỏ
  ];

  const { data, isLoading } = useQuery({
    queryKey: ["total-used-camera-by-brand", idCameraByBrand],
    queryFn: () => CameraApi.getTopCamerasByBrandId(idCameraByBrand, 10),
    enabled: !!idCameraByBrand, // Chỉ gọi API nếu `idCameraByBrand` có giá trị
  });

  useEffect(() => {
    if (data) {
      const usedCountArray =
        data.map((item) => item._count.cameraOnUsers) || [];
      const nameArray = data.map((item) => item.name) || [];
      setItemsName(nameArray);
      setSeries(usedCountArray);
    }
  }, [data]);

  // if (isLoading) {
  //   return (
  //     <div className="flex flex-col items-center justify-center h-[300px]">
  //       <LoadingOval />
  //     </div>
  //   );
  // }

  const options = {
    chart: {
      fontFamily: "Satoshi, sans-serif",
      type: "donut",
    },
    colors: brightColors.slice(0, itemsName.length), // Cắt mảng màu phù hợp với số lượng data
    labels: itemsName,
    legend: {
      show: false,
      position: "bottom",
    },
    plotOptions: {
      pie: {
        donut: {
          size: "65%",
          background: "transparent",
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    responsive: [
      {
        breakpoint: 2600,
        options: {
          chart: {
            width: 360,
          },
        },
      },
      {
        breakpoint: 640,
        options: {
          chart: {
            width: 200,
          },
        },
      },
    ],
  };

  return (
    <div className="sm:px-7.5 col-span-12 rounded-sm bg-boxdark shadow-default">
      {series.length > 0 && (
        <div className="p-3 text-[#eee] font-bold text-center">
          Số lượng người dùng sử dụng máy ảnh
          <span className="text-blue-400"> {nameCameraByBrand || ""} </span>
          theo tên mã theo tên mã theo tên mã
        </div>
      )}

      <div className="">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-[300px]">
            <LoadingOval />
          </div>
        ) : series.length === 0 ? (
          <div className="text-center text-xl font-bold flex items-center justify-center h-[300px] text-[#eee] py-4">
            Hãy nhấn chọn một hãng máy ảnh để thống kê
          </div>
        ) : (
          <div
            id="chartDashboardRevenue"
            className="mx-auto flex justify-center"
          >
            <ReactApexChart options={options} series={series} type="donut" />
          </div>
        )}
      </div>
      {series.length > 0 && (
        <div className="flex flex-col justify-center  py-4 gap-2 px-2">
          {series.map((value, index) => (
            <div
              key={index}
              className="flex border-b pb-2 mx-5 border-[#696969] items-center justify-between gap-2 text-[#eee]"
            >
              <div className="flex items-center gap-2 w-full">
                <span
                  className={`w-3 h-3 rounded-full`}
                  style={{ backgroundColor: brightColors[index % 10] }}
                ></span>
                {itemsName[index] || "Không rõ"}:
              </div>
              <div className="font-bold ">{value} </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChartTotalUsedCameraByBrand;

import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import formatPrice from "./../../utils/FormatPriceUtils";

const ChartDashboardTotalPhoto = ({
  nameChart,
  param1,
  param2,
  param3,
  nameParam1,
  nameParam2,
  nameParam3,
  isMoney = false,
  isRevenue = false,
}) => {
  const [series, setSeries] = useState([param1, param2, param3]);

  const options = {
    chart: {
      fontFamily: "Satoshi, sans-serif",
      type: "donut",
    },
    colors: ["#3C50E0", "#6577F3", "#80CAEE"],
    labels: [nameParam1, nameParam2, nameParam3],
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

  useEffect(() => {
    setSeries([param1, param2, param3]);
  }, [param1, param2, param3]);
  return (
    <div className="sm:px-7.5 col-span-12 rounded-sm bg-boxdark shadow-default">
      <div className="p-3 text-[#eee] font-bold flex items-center justify-center">
        {nameChart || ""}
      </div>

      <div className="">
        <div id="chartDashboardRevenue" className="mx-auto flex justify-center">
          <ReactApexChart options={options} series={series} type="donut" />
        </div>
      </div>
      <div className="flex flex-col justify-center items-center pt-4 gap-2 px-2">
        <div className="flex items-center justify-between  gap-2 text-[#eee]">
          <div className="flex items-center gap-2 w-full">
            <span className="w-3 h-3 rounded-full bg-[#3C50E0]"></span>{" "}
            {nameParam1 || ""}
          </div>
          <div className="font-bold">{series[0]}</div>
        </div>

        <div className="flex items-center justify-between  gap-2 text-[#eee]">
          <div className="flex items-center gap-2 ">
            <span className="w-3 h-3 rounded-full  bg-[#6577F3]"></span>{" "}
            {nameParam2 || ""}
          </div>
          <div className="font-bold">{series[1]}</div>
        </div>
        <div className="flex items-center justify-between  gap-2 text-[#eee]">
          <div className="flex items-center gap-2 ">
            <span className="w-3 h-3 rounded-full  bg-[#80CAEE]"></span>{" "}
            {nameParam3 || ""}
          </div>
          <div className="font-bold">{series[2]}</div>
        </div>
      </div>
    </div>
  );
};

export default ChartDashboardTotalPhoto;

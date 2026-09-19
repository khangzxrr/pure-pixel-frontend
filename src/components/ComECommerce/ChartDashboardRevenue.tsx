import { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import formatPrice from "./../../utils/FormatPriceUtils";
import { bytesToGigabytes } from "../../utils/bytesToGigabytes";

type ChartDashboardRevenueProps = {
  nameChart?: string;
  param1?: number;
  param2?: number;
  nameParam1?: string;
  nameParam2?: string;
  isMoney?: boolean;
  isRevenue?: boolean;
  total?: number;
  isPhoto?: boolean;
  isUser?: boolean;
};

const ChartDashboardRevenue = ({
  nameChart,
  param1,
  param2,
  nameParam1,
  nameParam2,
  isMoney = false,
  isRevenue = false,
  total,
  isPhoto = false,
  isUser = false,
}: ChartDashboardRevenueProps) => {
  const [series, setSeries] = useState([param1, param2]);

  const options: ApexOptions = {
    chart: {
      fontFamily: "Satoshi, sans-serif",
      type: "donut",
    },
    colors: ["#3C50E0", "#6577F3"],
    // the chart is also rendered without names (ComTotalUsers); ApexCharts receives them as given
    labels: [nameParam1, nameParam2] as string[],
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
    // tooltip: {
    //   y: {
    //     formatter: (val) => {
    //       return `${val.toLocaleString()}đ`;
    //     },
    //   },
    // },
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
    setSeries([param1, param2]);
  }, [param1, param2]);
  return (
    <div className="sm:px-7.5 col-span-12 rounded-sm bg-boxdark shadow-default">
      <div className="p-3 text-[#eee] font-bold flex items-center justify-center">
        {nameChart || ""}
      </div>
      <div className="text-[#eee] text-center font-bold">
        {isRevenue && formatPrice(Number(param1) + Number(param2))}
        {isPhoto && bytesToGigabytes(total) + ` GB`}
      </div>
      <div className="">
        <div id="chartDashboardRevenue" className="mx-auto flex justify-center">
          <ReactApexChart
            options={options}
            // values may be missing while the dashboard has no data; ApexCharts receives them as given
            series={series as number[]}
            type="donut"
          />
        </div>
      </div>
      <div className="flex flex-col justify-center items-center pt-4 gap-2 px-2">
        <div className="flex items-center justify-between  gap-2 text-[#eee]">
          <div className="flex items-center gap-2 w-full">
            <span className="w-3 h-3 rounded-full bg-[#3C50E0]"></span>{" "}
            {nameParam1 || ""}
          </div>
          <div className="font-bold  ">
            {isUser && series[0]}
            {isMoney && formatPrice(series[0])}
            {isPhoto && (
              <div className="w-[100px]">
                {bytesToGigabytes(series[0]) + ` GB`}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between  gap-2 text-[#eee]">
          <div className="flex items-center gap-2 ">
            <span className="w-3 h-3 rounded-full  bg-[#6577F3]"></span>{" "}
            {nameParam2 || ""}
          </div>
          <div className="font-bold">
            {isUser && series[1]}
            {isMoney && formatPrice(series[1])}
            {isPhoto && bytesToGigabytes(series[1]) + ` GB`}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartDashboardRevenue;

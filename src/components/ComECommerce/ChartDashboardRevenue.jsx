import React, { useState } from "react";
import ReactApexChart from "react-apexcharts";

const options = {
  chart: {
    fontFamily: "Satoshi, sans-serif",
    type: "donut",
  },
  colors: ["#3C50E0", "#6577F3"],
  labels: ["Lợi nhuận chiết khấu bán ảnh", "Doanh thu gói nâng cấp"],
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
  tooltip: {
    y: {
      formatter: (val) => {
        return `${val.toLocaleString()}đ`;
      },
    },
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

const ChartDashboardRevenue = () => {
  const [series, setSeries] = useState([5000000, 15000000]);

  return (
    <div className="sm:px-7.5 col-span-12 rounded-sm bg-boxdark shadow-default">
      <div className="p-3 text-[#eee] font-bold flex items-center justify-center">
        Thống kê tổng doanh thu
      </div>
      <div className="">
        <div id="chartDashboardRevenue" className="mx-auto flex justify-center">
          <ReactApexChart options={options} series={series} type="donut" />
        </div>
      </div>
      <div className="flex flex-col gap-2 px-2">
        <div className="flex items-center justify-between  gap-2 text-[#eee]">
          <div className="flex items-center gap-2 w-full">
            <span className="w-3 h-3 rounded-full bg-[#6577F3]"></span> Doanh
            thu gói nâng cấp
          </div>
          <div className="font-bold">{series[1].toLocaleString()}đ</div>
        </div>

        <div className="flex items-center justify-between  gap-2 text-[#eee]">
          <div className="flex items-center gap-2 ">
            <span className="w-3 h-3 rounded-full bg-[#3C50E0]"></span> Lợi
            nhuận chiết khấu bán ảnh
          </div>
          <div className="font-bold">{series[0].toLocaleString()}đ</div>
        </div>
      </div>
    </div>
  );
};

export default ChartDashboardRevenue;

import React, { useState } from "react";
import ReactApexChart from "react-apexcharts";

const ChartDashboardUpgradePackage = () => {
  const [state, setState] = React.useState({
    series: [
      {
        data: [
          { x: "South Korea", y: 400, fillColor: "#3C50E0" },
          { x: "Canada", y: 430, fillColor: "#80CAEE" },
          { x: "United Kingdom", y: 448, fillColor: "#BEC922" },
          { x: "Netherlands", y: 470, fillColor: "#FF6F61" },
          { x: "Italy", y: 540, fillColor: "#8E44AD" },
        ],
      },
    ],
    options: {
      chart: {
        type: "bar",
        height: 420,
        background: "#32353b", // Màu nền cho biểu đồ (Dark Mode)
        toolbar: {
          show: false, // Ẩn nút menu
        },
      },
      plotOptions: {
        bar: {
          borderRadius: 4,
          borderRadiusApplication: "end",
          horizontal: true,
        },
      },
      responsive: [
        {
          breakpoint: 1024,
          options: {
            chart: {
              height: 300,
            },
          },
        },
        {
          breakpoint: 1366,
          options: {
            chart: {
              height: 350,
            },
          },
        },
      ],
      dataLabels: {
        enabled: false,
      },
      grid: {
        borderColor: "#43474e", // Màu lưới
        xaxis: {
          lines: {
            show: true,
          },
        },
        yaxis: {
          lines: {
            show: false, // Không hiển thị lưới dọc
          },
        },
      },
      xaxis: {
        categories: [
          "South Korea",
          "Canada",
          "United Kingdom",
          "Netherlands",
          "Italy",
        ],
        labels: {
          style: {
            colors: "#eee", // Màu chữ trục X
          },
        },
      },
      yaxis: {
        labels: {
          style: {
            colors: "#eee", // Màu chữ trục Y
          },
        },
      },
      tooltip: {
        theme: "dark", // Tooltip chế độ tối
      },
    },
  });

  return (
    <div className="col-span-12 rounded-sm  px-5 pt-7.5  shadow-default sm:px-7.5 xl:col-span-8">
      <div id="chart">
        <ReactApexChart
          className="-ml-5"
          options={state.options}
          series={state.series}
          type="bar"
          height={420}
        />
      </div>
    </div>
  );
};

export default ChartDashboardUpgradePackage;

import React from "react";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
ChartJS.register(
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
);
const TotalMoneyUpgrade = ({ nameChart, labelArray, dataArray }) => {
  const data = {
    labels: labelArray,
    datasets: [
      {
        label: "Doanh thu",
        data: dataArray,
        borderColor: "rgba(54, 162, 235, 1)", // Màu đường
        backgroundColor: "rgba(54, 162, 235, 0.2)", // Màu nền dưới đường
        tension: 0, // Độ cong của đường
        pointBackgroundColor: "rgba(54, 162, 235, 1)", // Màu điểm
        pointBorderColor: "#fff", // Viền điểm
        fill: true, // Kích hoạt hiệu ứng đổ màu
      },
    ],
  };

  // Tùy chọn biểu đồ
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        color: "#202225",
        font: {
          size: 16,
        },
        text: nameChart || "Biểu đồ doanh thu", // Tiêu đề
      },
      legend: {
        position: "top",
        labels: {
          color: "#202225", // Màu chữ của legend
          font: {
            size: 14, // Kích thước chữ của legend
          },
        },
      },
    },
    // scales: {
    //   y: {
    //     ticks: {
    //       callback: (value) =>
    //         value.toLocaleString("vi-VN", {
    //           style: "currency",
    //           currency: "VND",
    //         }),
    //     },
    //   },
    // },
  };

  return (
    <div
      className="chart-container bg-[#eee] rounded-md shadow-xl p-3"
      style={{ overflow: "hidden", display: "inline-block" }}
    >
      {/* Đặt width và height cố định */}
      <Line data={data} options={options} width={600} height={400} />
    </div>
  );
};

export default TotalMoneyUpgrade;

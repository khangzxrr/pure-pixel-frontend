import React, { useEffect, useRef } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2"; // Import biểu đồ Bar

// Đăng ký các thành phần của Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const BarChart = ({ nameChart, labelArray, dataArray }) => {
  const chartRef = useRef(null);

  // Dữ liệu của biểu đồ
  const data = {
    labels: labelArray,
    datasets: [
      {
        label: "Doanh thu",
        data: dataArray,
        borderColor: "rgba(54, 162, 235, 1)",
        backgroundColor: "rgba(54, 162, 235, 0.2)",
        borderWidth: 1, // Độ dày của đường viền cột
      },
    ],
  };

  // Cấu hình cho biểu đồ
  const options = {
    responsive: true, // Đảm bảo biểu đồ phản hồi với thay đổi kích thước
    maintainAspectRatio: false, // Tắt giữ tỉ lệ khung hình
    plugins: {
      legend: {
        position: "top", // Vị trí của legend
      },
      title: {
        display: true,
        text: nameChart || "Biểu đồ cột", // Tiêu đề cho biểu đồ
        font: {
          size: 16, // Kích thước chữ tiêu đề
        },
        color: "#202225", // Màu chữ tiêu đề
      },
    },
    scales: {
      x: {
        beginAtZero: true, // Đảm bảo trục X bắt đầu từ 0
      },
      y: {
        beginAtZero: true, // Đảm bảo trục Y bắt đầu từ 0
      },
    },
    animation: {
      duration: 2000, // Thời gian hoạt hình
      easing: "easeInOutQuad", // Hiệu ứng easing
      loop: false, // Lặp lại hoạt hình
    },
  };

  useEffect(() => {
    const chart = chartRef.current;
    if (chart) {
      chart.update();
    }
  }, []);

  return (
    <div
      style={{
        overflow: "hidden",
        display: "inline-block",
        width: "100%",
        height: "500px",
      }} // Set chiều rộng và chiều cao
      className="chart-container bg-[#eee] rounded-md shadow-xl p-3"
    >
      <Bar
        data={data}
        options={options}
        ref={(instance) => {
          if (instance) chartRef.current = instance.chart;
        }}
      />
    </div>
  );
};

export default BarChart;

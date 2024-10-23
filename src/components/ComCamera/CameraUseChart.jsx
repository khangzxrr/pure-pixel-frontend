import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Đăng ký các thành phần mà Line chart cần
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Hàm tạo ngẫu nhiên màu sắc (RGBA)
const getRandomColor = () => {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  return `rgba(${r},${g},${b},1)`; // Màu border (full opacity)
};

const getRandomBackgroundColor = () => {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  return `rgba(${r},${g},${b},0.2)`; // Màu nền (20% opacity)
};

// Hàm tạo ngẫu nhiên dữ liệu số
const getRandomData = (numPoints) => {
  const data = [];
  for (let i = 0; i < numPoints; i++) {
    data.push(Math.floor(Math.random() * 100)); // Giá trị ngẫu nhiên từ 0 - 100
  }
  return data;
};

const CameraUseChart = () => {
  // Dữ liệu của biểu đồ
  const data = {
    labels: ["January", "February", "March", "April", "May", "June", "July"],
    datasets: [
      {
        label: "Nikon D3500",
        data: getRandomData(7), // Gọi hàm để tạo dữ liệu ngẫu nhiên cho 7 điểm
        borderColor: getRandomColor(),
        backgroundColor: getRandomBackgroundColor(),
        tension: 0.4, // Độ cong của đường line
        fill: true, // Tô màu dưới đường line
      },
    ],
  };

  // Cấu hình cho biểu đồ
  const options = {
    responsive: true,
    maintainAspectRatio: false, // Để cho phép biểu đồ thay đổi kích thước tự do
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: "#eee", // Đặt màu chữ cho chú giải
          font: {
            size: 14, // Kích thước chữ cho chú giải
          },
        },
      },
      title: {
        display: true,
        text: "Sử dụng máy ảnh D3500 trong năm nay",
        color: "#eee", // Đặt màu chữ cho tiêu đề
        font: {
          size: 16, // Kích thước chữ cho tiêu đề
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: "#565b63", // Đặt màu cho lưới trục x
        },
        ticks: {
          color: "#eee", // Đặt màu chữ cho trục x
        },
      },
      y: {
        grid: {
          color: "#565b63", // Đặt màu cho lưới trục y
        },
        ticks: {
          color: "#eee", // Đặt màu chữ cho trục y
        },
      },
    },
  };

  return (
    <div
      className="bg-[#2f3136] p-4 "
      style={{ width: "100%", height: "400px" }}
    >
      <Line data={data} options={options} />
    </div>
  );
};

export default CameraUseChart;

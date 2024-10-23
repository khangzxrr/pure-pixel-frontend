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

const CameraChart = () => {
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
      {
        label: "Nikon D5600",
        data: getRandomData(7), // Gọi hàm để tạo dữ liệu ngẫu nhiên cho 7 điểm
        borderColor: getRandomColor(),
        backgroundColor: getRandomBackgroundColor(),
        tension: 0.4, // Độ cong của đường line
        fill: true, // Tô màu dưới đường line
      },
      {
        label: "Canon EOS R5",
        data: getRandomData(7), // Gọi hàm để tạo dữ liệu ngẫu nhiên cho 7 điểm
        borderColor: getRandomColor(),
        backgroundColor: getRandomBackgroundColor(),
        tension: 0.4, // Độ cong của đường line
        fill: true, // Tô màu dưới đường line
      },
      {
        label: "Sony A7R II",
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
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Những máy ảnh trong công động PurePixel",
      },
    },
  };

  return (
    <div className="bg-[#eee] p-4 shadow-md rounded-md">
      <Line data={data} options={options} />
    </div>
  );
};

export default CameraChart;

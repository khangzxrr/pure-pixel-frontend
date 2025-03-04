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

// Hàm tạo ngẫu nhiên dữ liệu số
const getRandomData = (numPoints) => {
  const data = [];
  for (let i = 0; i < numPoints; i++) {
    data.push(Math.floor(Math.random() * 100)); // Giá trị ngẫu nhiên từ 0 - 100
  }
  return data;
};

const CameraUseChart = ({ cameraData }) => {
  // Dữ liệu của biểu đồ
  const data = {
    labels: ["January", "February", "March", "April", "May", "June", "July"],
    datasets: [
      {
        label: `${cameraData.name}`,
        data: getRandomData(7), // Gọi hàm để tạo dữ liệu ngẫu nhiên cho 7 điểm
        borderColor: "#eee",
        backgroundColor: "#2f3135",
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
        text: `Sử dụng ${cameraData.name} trong năm nay`,
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
    <div className="bg-[#2f3136] p-4 md:w-[90%] w-[380px] h-[400px]">
      <Line data={data} options={options} />
    </div>
  );
};

export default CameraUseChart;

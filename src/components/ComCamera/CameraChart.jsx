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
import CameraApi from "../../apis/CameraApi";
import { useQuery } from "@tanstack/react-query";

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

const CameraChart = () => {
  const fetchCameraChart = async () => {
    const response = await CameraApi.getCameraChart();
    return response;
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ["cameraChart"],
    queryFn: fetchCameraChart,
  });

  // Xử lý dữ liệu từ API
  const processData = (apiData) => {
    // Lấy ra tất cả các timestamps và làm nhãn cho biểu đồ
    const labels = apiData.map((item) =>
      new Date(item.timestamp).toLocaleDateString("vi-VN")
    );

    // Lấy tất cả các cameras và tạo datasets dựa trên tên camera
    const cameraMap = new Map();

    apiData.forEach((item) => {
      item.popularCameraDataPoints.forEach((dataPoint) => {
        const cameraName = dataPoint.camera.name;

        // Nếu camera chưa có trong map, thêm vào
        if (!cameraMap.has(cameraName)) {
          cameraMap.set(cameraName, {
            label: cameraName,
            data: Array(apiData.length).fill(0), // Mảng số liệu với độ dài bằng số labels
            borderColor: getRandomColor(),
            backgroundColor: "#2f3136",
            tension: 0.4,
            fill: true,
          });
        }

        // Tìm chỉ số của timestamp hiện tại để đặt giá trị userCount
        const index = labels.findIndex(
          (label) =>
            label === new Date(item.timestamp).toLocaleDateString("vi-VN")
        );

        // Cập nhật dữ liệu cho camera
        if (index !== -1) {
          cameraMap.get(cameraName).data[index] = dataPoint.userCount;
        }
      });
    });

    // Chuyển map thành mảng datasets
    const datasets = Array.from(cameraMap.values());

    return { labels, datasets };
  };

  // Nếu đang tải hoặc có lỗi, hiển thị thông báo
  if (isLoading) return <div>Đang tải...</div>;
  if (isError) return <div>Có lỗi xảy ra</div>;

  // Xử lý dữ liệu từ API
  const chartData = processData(data || []);

  // Cấu hình cho biểu đồ
  const options = {
    responsive: true,
    maintainAspectRatio: false,
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
        text: "Các máy ảnh được sử dụng phổ biến theo ngày",
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
      className="bg-[#2f3136] p-4"
      style={{ width: "100%", height: "400px" }}
    >
      <Line data={chartData} options={options} />
    </div>
  );
};

export default CameraChart;

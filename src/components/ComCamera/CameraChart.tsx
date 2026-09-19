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
  type ChartData,
  type ChartOptions,
} from "chart.js";
import CameraApi from "../../apis/CameraApi";
import { useQuery } from "@tanstack/react-query";
import type { Schema } from "../../apis/types";

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

type CameraDataset = {
  label: string;
  data: number[];
  borderColor: string;
  backgroundColor: string;
  tension: number;
  fill: boolean;
};

// Hàm tạo ngẫu nhiên màu sắc (RGBA)
const getRandomColor = () => {
  const r = Math.floor(Math.random() * 128) + 128;
  const g = Math.floor(Math.random() * 128) + 128;
  const b = Math.floor(Math.random() * 128) + 128;
  return `rgba(${r},${g},${b},1)`;
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
  const processData = (
    apiData: Schema<"PopularCameraTimelineDto">[]
  ): ChartData<"line", number[], string> => {
    // Khởi tạo Set để đảm bảo ngày là duy nhất và mảng để lưu các camera
    const labelsSet = new Set<string>();
    const cameraMap = new Map<string, CameraDataset>();

    // Duyệt qua từng bản ghi từ API để tạo các nhãn ngày và dữ liệu camera
    apiData.forEach((item) => {
      // Chuyển đổi timestamp thành định dạng ngày
      const dateLabel = new Date(item.timestamp).toLocaleDateString("vi-VN");
      labelsSet.add(dateLabel);

      item.popularCameraDataPoints.forEach((dataPoint) => {
        const cameraName = dataPoint.camera.name;

        // Nếu camera chưa có trong map, thêm vào map với dữ liệu mặc định
        let dataset = cameraMap.get(cameraName);
        if (!dataset) {
          dataset = {
            label: cameraName,
            data: Array.from(labelsSet).map(() => 0), // Mảng số liệu với các giá trị 0
            borderColor: getRandomColor(),
            backgroundColor: "#2f3136",
            tension: 0.4,
            fill: true,
          };
          cameraMap.set(cameraName, dataset);
        }

        // Cập nhật dữ liệu userCount vào mảng data cho đúng ngày
        const labelsArray = Array.from(labelsSet);
        const index = labelsArray.indexOf(dateLabel);
        if (index !== -1) {
          dataset.data[index] = dataPoint.userCount;
        }
      });
    });

    // Chuyển Set thành mảng để tạo labels
    const labels = Array.from(labelsSet);

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
  const options: ChartOptions<"line"> = {
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
        min: 0, // Đặt giá trị tối thiểu của trục y là 0
      },
    },
  };

  return (
    <div className="bg-[#2f3136] p-4 md:w-[99%] w-[380px]  h-[400px]">
      <Line data={chartData} options={options} />
    </div>
  );
};

export default CameraChart;

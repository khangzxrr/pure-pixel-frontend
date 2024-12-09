import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";

const ChartDashboardUpgradePackage = ({ dashBoardData }) => {
  const [maxUserTotal, setMaxUserTotal] = useState(0);
  const [chartData, setChartData] = useState({
    series: [],
    options: {},
  });

  // Tính giá trị lớn nhất
  useEffect(() => {
    if (dashBoardData?.topUsedUpgradePackage?.length > 0) {
      const maxUser = dashBoardData.topUsedUpgradePackage.reduce(
        (max, item) => (item?.totalUsed > max ? item?.totalUsed : max),
        0
      );
      setMaxUserTotal(maxUser);
    }
  }, [dashBoardData]);

  // Cập nhật dữ liệu và cấu hình biểu đồ
  useEffect(() => {
    if (dashBoardData?.topUsedUpgradePackage) {
      const seriesData = dashBoardData.topUsedUpgradePackage.map((item) => ({
        x: item?.upgradePackageDto?.name,
        y: item?.totalUsed,
        fillColor:
          item?.upgradePackageDto?.name === "Nâng cao"
            ? "#00eeff"
            : item?.upgradePackageDto?.name === "Bắt đầu"
            ? "#0dff00"
            : "#ffe100",
      }));

      setChartData({
        series: [
          {
            name: "Số lượng người nâng cấp gói này là",
            data: seriesData,
          },
        ],
        options: {
          chart: {
            type: "bar",
            height: 420,
            background: "#32353b",
            toolbar: {
              show: false,
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
            borderColor: "#43474e",
            xaxis: {
              lines: {
                show: true,
              },
            },
            yaxis: {
              lines: {
                show: true,
              },
            },
          },
          xaxis: {
            categories: ["Gói nâng cao", "Gói bắt đầu", "Cao cấp"],
            labels: {
              style: {
                colors: "#eee",
              },
              formatter: (val) => Math.round(val), // Đảm bảo chỉ hiển thị số nguyên
            },
            min: 0,
            max: maxUserTotal + 2,
            tickAmount: maxUserTotal / 2,
          },
          yaxis: {
            labels: {
              style: {
                colors: "#eee",
              },
            },
          },
          tooltip: {
            theme: "dark",
          },
        },
      });
    }
  }, [dashBoardData, maxUserTotal]);

  return (
    <div className="col-span-12 rounded-sm  px-5 pt-7.5  shadow-default sm:px-7.5 xl:col-span-8">
      <div id="chart">
        {chartData.series.length > 0 && (
          <ReactApexChart
            className="-ml-5"
            options={chartData.options}
            series={chartData.series}
            type="bar"
            height={420}
          />
        )}
      </div>
    </div>
  );
};

export default ChartDashboardUpgradePackage;

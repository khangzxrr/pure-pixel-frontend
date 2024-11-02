import React, { useEffect, useState } from "react";
import { Typography, message, Avatar } from "antd";
import ComDateConverter from "../../components/ComDateConverter/ComDateConverter";
import ComMenuButonTable from "../../components/ComMenuButonTable/ComMenuButonTable";
import { getData } from "../../apis/api";
import ComTable from "../../components/ComTable/ComTable";
import useColumnFilters from "../../components/ComTable/utils";
import { useTableState } from "../../hooks/useTableState";
import { useMutation } from "@tanstack/react-query";
import PhotoShootApi from "../../apis/PhotoShootApi";

function formatCurrency(number) {
  if (typeof number === "number") {
    return number.toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
    });
  } else if (typeof number === "string" && !isNaN(Number(number))) {
    return Number(number).toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
    });
  } else {
    return number;
  }
}

export default function PhotoshootRegistrationTable() {
  const [data, setData] = useState([]);
  const { getColumnSearchProps, getColumnApprox, getColumnPriceRangeProps } =
    useColumnFilters();
  const table = useTableState();
  const handleRequestByPhotographer = useMutation({
    mutateKey: "handle-request-by-photographer",
    mutationFn: async ({ bookingId, type }) =>
      await PhotoShootApi.handleRequestByPhotographer(bookingId, type),
    onSuccess: () => {
      reloadData();
      message.success("Thao tác thành công");
    },
  });
  const columns = [
    {
      title: "Gói chụp ảnh",
      dataIndex: "photoshootPackageHistory",
      key: "photoshootPackageHistory",
      width: "8%",
      render: (text, record) => (
        <div className="flex flex-col justify-center text-center">
          <img
            className="mx-auto block"
            src={record?.photoshootPackageHistory?.thumbnail}
            // src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQZDtUlRAg7_WcScnVpdT_675F4OFHvXKf6FA&s"
            alt={record?.photoshootPackageHistory?.title}
            style={{ width: "4vw", height: "8vh" }}
          />
          <div>
            <p className="text-white font-thin text-xs pt-1">
              {record?.photoshootPackageHistory?.title}
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "Thời gian Bắt đầu",
      dataIndex: "startDate",
      key: "startDate",
      width: "10%",
      sorter: (a, b) => new Date(a.startDate) - new Date(b.startDate),
      ...getColumnApprox("startDate", "Bắt đầu"),
      render: (text, record) => (
        <div style={{ textAlign: "center" }}>
          <ComDateConverter time={true}>{record?.startDate}</ComDateConverter>
        </div>
      ),
    },
    {
      title: "Thời gian Kết thúc",
      dataIndex: "endDate",
      key: "endDate",
      width: "10%",
      sorter: (a, b) => new Date(a.endDate) - new Date(b.endDate),
      ...getColumnApprox("endDate", "Kết thúc"),
      render: (text, record) => (
        <div style={{ textAlign: "center" }}>
          <ComDateConverter time={true}>{record?.endDate}</ComDateConverter>
        </div>
      ),
    },
    {
      title: "Khách hàng",
      dataIndex: "user",
      key: "user",
      width: "10%",
      ...getColumnSearchProps(["user", "name"], "Khách hàng"),
      render: (text, record) => (
        <div style={{ textAlign: "center" }}>
          <Avatar
            src={record.originalPhotoshootPackage.user?.avatar}
            alt={record?.user?.name}
          />
          <Typography.Text className="ml-2 text-white">
            {record?.originalPhotoshootPackage.user?.name}
          </Typography.Text>
        </div>
      ),
    },
    {
      title: "Giá",
      dataIndex: ["photoshootPackageHistory", "price"],
      key: "price",
      width: "7%",
      sorter: (a, b) =>
        a.photoshootPackageHistory.price - b.photoshootPackageHistory.price,
      ...getColumnPriceRangeProps(["photoshootPackageHistory", "price"], "Giá"),
      render: (text, record) => (
        <div style={{ textAlign: "center" }}>
          <Typography.Text className="text-white">
            {formatCurrency(record?.photoshootPackageHistory?.price)}
          </Typography.Text>
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: "7%",
      filters: [
        { text: "Mới", value: "REQUESTED" },
        { text: "Đã nhận", value: "ACCEPTED" },
        { text: "Từ chối", value: "DENIED" },
      ],
      onFilter: (value, record) => record.status === value,
      render: (text) => {
        let statusText;
        let textColor;
        switch (text) {
          case "REQUESTED":
            statusText = "Đang chờ";
            textColor = "orange";
            break;
          case "ACCEPTED":
            statusText = "Đang nhận";
            textColor = "green";
            break;
          case "DENIED":
            statusText = "Đã từ chối";
            textColor = "red";
            break;
          default:
            statusText = text;
            textColor = "white";
        }
        return (
          <div style={{ textAlign: "center" }}>
            <span style={{ color: textColor }}>{statusText}</span>
          </div>
        );
      },
    },
    {
      title: "Thao tác",
      key: "operation",
      width: "10%",
      render: (_, record) => (
        <div style={{ textAlign: "center" }}>
          {record.status === "REQUESTED" ? (
            <div className="flex space-x-2">
              <button
                className="bg-green-500 text-white px-2 py-1 rounded"
                onClick={() => {
                  handleRequestByPhotographer.mutate({
                    bookingId: record.id,
                    type: "accept",
                  });
                }}
              >
                Đồng ý
              </button>
              <button
                className="bg-red-500 text-white px-2 py-1 rounded"
                onClick={() => {
                  handleRequestByPhotographer.mutate({
                    bookingId: record.id,
                    type: "deny",
                  });
                }}
              >
                Từ chối
              </button>
            </div>
          ) : (
            <ComMenuButonTable
              record={record}
              excludeDefaultItems={[]}
              // Bạn có thể thêm các hành động như xem chi tiết, phê duyệt, từ chối ở đây
            />
          )}
        </div>
      ),
    },
  ];

  const reloadData = () => {
    getData("/photographer/booking/me?limit=9999&page=0")
      .then((response) => {
        setData(response?.data?.objects || []);
        table.handleCloseLoading();
      })
      .catch((error) => {
        console.error("Error fetching items:", error);
        message.error("Lỗi khi tải dữ liệu");
        table.handleCloseLoading();
      });
  };

  useEffect(() => {
    reloadData();
  }, []);

  return (
    <div className="p-4 flex w-[80vw]">
      <ComTable
        x={"60vw"}
        y={"90vh"}
        columns={columns}
        dataSource={data}
        loading={table.loading}
        rowKey="id"
        // scroll={{ x: 1500, y: 500 }}
      />
    </div>
  );
}

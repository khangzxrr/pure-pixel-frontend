import React, { useEffect, useState } from "react";
import { Table, Typography, message, Avatar, Tooltip, Button } from "antd";
import ComDateConverter from "../../components/ComDateConverter/ComDateConverter";
import ComMenuButonTable from "../../components/ComMenuButonTable/ComMenuButonTable";
import { getData } from "../../apis/api";
import ComTable from "../../components/ComTable/ComTable";
import useColumnFilters from "../../components/ComTable/utils";
import { useTableState } from "../../hooks/useTableState";

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

  const columns = [
    {
      title: "Bắt đầu",
      dataIndex: "startDate",
      fixed: "left",
      key: "startDate",
      width: 150,
      sorter: (a, b) => new Date(a.startDate) - new Date(b.startDate),
      ...getColumnApprox("startDate", "Bắt đầu"),
      render: (text, record) => (
        <ComDateConverter>{record.startDate}</ComDateConverter>
      ),
    },
    {
      title: "Kết thúc",
      dataIndex: "endDate",
      key: "endDate",
      width: 150,
      sorter: (a, b) => new Date(a.endDate) - new Date(b.endDate),
      ...getColumnApprox("endDate", "Kết thúc"),
      render: (text, record) => (
        <ComDateConverter>{record.endDate}</ComDateConverter>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      filters: [
        { text: "Pending", value: "PENDING" },
        { text: "Approved", value: "APPROVED" },
        { text: "Rejected", value: "REJECTED" },
        // Add other status options as needed
      ],
      onFilter: (value, record) => record.status === value,
      render: (text) => <>{text}</>,
    },
    {
      title: "Khách hàng",
      dataIndex: "user",
      key: "user",
      width: 150,
      ...getColumnSearchProps(["user", "name"], "Khách hàng"),
      render: (text, record) => (
        <div>
          <Avatar src={record.user.avatar} alt={record.user.name} />
          <Typography.Text className="ml-2">{record.user.name}</Typography.Text>
        </div>
      ),
    },
    {
      title: "Gói chụp ảnh",
      dataIndex: "photoshootPackageHistory",
      key: "photoshootPackageHistory",
      width: 200,
      render: (text, record) => (
        <div>
          <img
            src={record.photoshootPackageHistory.thumbnail}
            alt={record.photoshootPackageHistory.title}
            style={{ width: "80px", height: "80px", objectFit: "cover" }}
          />
          <div>
            <Typography.Text strong>
              {record.photoshootPackageHistory.title}
            </Typography.Text>
            <br />
            <Typography.Text>
              {record.photoshootPackageHistory.subtitle}
            </Typography.Text>
          </div>
        </div>
      ),
    },
    {
      title: "Giá",
      dataIndex: ["photoshootPackageHistory", "price"],
      key: "price",
      width: 120,
      sorter: (a, b) =>
        a.photoshootPackageHistory.price - b.photoshootPackageHistory.price,
      ...getColumnPriceRangeProps(["photoshootPackageHistory", "price"], "Giá"),
      render: (text, record) => (
        <Typography.Text>
          {formatCurrency(record.photoshootPackageHistory.price)}
        </Typography.Text>
      ),
    },
    {
      title: "Nhiếp ảnh gia",
      dataIndex: ["originalPhotoshootPackage", "user"],
      key: "photographer",
      width: 150,
      ...getColumnSearchProps(
        ["originalPhotoshootPackage", "user", "name"],
        "Nhiếp ảnh gia"
      ),
      render: (text, record) => (
        <div>
          <Avatar
            src={record.originalPhotoshootPackage.user.avatar}
            alt={record.originalPhotoshootPackage.user.name}
          />
          <Typography.Text className="ml-2">
            {record.originalPhotoshootPackage.user.name}
          </Typography.Text>
        </div>
      ),
    },
    {
      title: "Ảnh đã chụp",
      dataIndex: "photos",
      key: "photos",
      width: 120,
      render: (text, record) => (
        <Typography.Text>{record.photos.length} ảnh</Typography.Text>
      ),
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      width: 200,
      ...getColumnSearchProps("description", "Mô tả"),
      render: (text) => (
        <Typography.Paragraph ellipsis={{ rows: 2, expandable: true }}>
          {text}
        </Typography.Paragraph>
      ),
    },
    {
      title: "Thao tác",
      key: "operation",
      fixed: "right",
      width: 100,
      render: (_, record) => (
        <div className="flex items-center flex-col">
          <ComMenuButonTable
            record={record}
            excludeDefaultItems={[]}
            // Bạn có thể thêm các hành động như xem chi tiết, phê duyệt, từ chối ở đây
          />
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
    <div className="p-4">
      <ComTable
        columns={columns}
        dataSource={data}
        loading={table.loading}
        rowKey="id"
        scroll={{ x: 1500, y: 500 }}
      />
    </div>
  );
}

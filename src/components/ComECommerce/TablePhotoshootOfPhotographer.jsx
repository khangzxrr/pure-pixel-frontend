import React from "react";
import {
  ConfigProvider,
  message,
  Modal,
  notification,
  Pagination,
  Table,
} from "antd";
import { useNavigate } from "react-router-dom";
const TablePhotoshootOfPhotographer = () => {
  const navigate = useNavigate();
  const columns = [
    { title: "Xếp hạng", dataIndex: "photoshootRank", width: 125 },
    {
      title: "Tên",
      dataIndex: "name",

      render: (text, record) => <p>{text}</p>,
    },
    {
      title: "Ngày tạp",
      dataIndex: "createdDate",
    },
    {
      title: "Tổng số lượt đặt",
      dataIndex: "totalPhotoshootOrder",
    },
  ];

  const dataPhotoshootPackages = [
    {
      id: 1,
      photoshootRank: 1,
      name: "Trần Thanh Tường",
      createdDate: "2023-01-01",
      totalPhotoshootOrder: 10,
    },
    {
      id: 2,
      photoshootRank: 1,
      name: "Trần Thanh Tường",
      createdDate: "2023-01-01",
      totalPhotoshootOrder: 10,
    },
    {
      id: 3,
      photoshootRank: 1,
      name: "Trần Thanh Tường",
      createdDate: "2023-01-01",
      totalPhotoshootOrder: 10,
    },
  ];
  return (
    <div className="bg-[#32353b] rounded-sm">
      <div className="flex items-center justify-center p-4 font-bold text-[#eee]">
        Danh sách xếp hạng các gói dịch được đặt nhiều nhất
      </div>
      <Table
        // loading={isLoading}
        columns={columns}
        dataSource={dataPhotoshootPackages}
        // onChange={onChange}
        scroll={{
          x: 500, // Chiều rộng để bảng cuộn ngang nếu nội dung vượt quá
          y: "73vh", // Chiều cao cố định để bảng cuộn dọc
        }}
        pagination={false}
        showSorterTooltip={{
          target: "sorter-icon",
        }}
      />
    </div>
  );
};

export default TablePhotoshootOfPhotographer;

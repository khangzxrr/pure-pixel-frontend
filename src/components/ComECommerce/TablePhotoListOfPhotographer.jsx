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
const TablePhotoListOfPhotographer = () => {
  const navigate = useNavigate();
  const columns = [
    { title: "Xếp hạng", dataIndex: "photoRank" },
    {
      title: "Tên",
      dataIndex: "name",
      render: (text, record) => <p>{text}</p>,
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdDate",
    },
    { title: "Tổng số ảnh đã bán", dataIndex: "totalPhotoSold" },
  ];

  const dataPhotographers = [
    {
      id: 1,
      photoRank: 1,
      name: "Trần Thanh Tường",
      createdDate: "2023-01-01",
      totalPhotoSold: 10,
    },
    {
      id: 2,
      photoRank: 1,
      name: "Trần Thanh Tường",

      createdDate: "2023-01-01",

      totalPhotoSold: 10,
    },
    {
      id: 3,
      photoRank: 1,
      name: "Trần Thanh Tường",
      createdDate: "2023-01-01",

      totalPhotoSold: 10,
    },
  ];
  return (
    <div className="bg-[#32353b] rounded-sm">
      <div className="flex items-center justify-center p-4 font-bold text-[#eee]">
        Danh sách xếp hạng các ảnh được mua nhiều nhất
      </div>
      <Table
        // loading={isLoading}
        columns={columns}
        dataSource={dataPhotographers}
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

export default TablePhotoListOfPhotographer;

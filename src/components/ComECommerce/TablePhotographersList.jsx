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
const TablePhotographersList = ({ dataTopSeller }) => {
  const navigate = useNavigate();
  const columns = [
    {
      title: "Tên",
      dataIndex: "name",
      render: (text, record) => (
        <div className="flex items-center gap-3">
          <img
            src={record.avatar || "https://via.placeholder.com/40"}
            alt="Avatar"
            className="w-9 h-9 rounded-full object-cover bg-[#eee]"
          />
          <span
            onClick={() => navigate(`ptgDetail/${record.id}`)}
            className="hover:cursor-pointer hover:underline text-blue-400"
          >
            {text}
          </span>
        </div>
      ),
    },
    { title: "Email", dataIndex: "email" },
    { title: "Số điện thoại", dataIndex: "phoneNumber" },
    { title: "Địa chỉ", dataIndex: "location" },
    { title: "Tổng số ảnh đã bán", dataIndex: "totalPhotoSold" },
  ];

  const dataPhotographers = dataTopSeller?.map((item) => ({
    id: item.id,
    name: item.detail.name,
    avatar: item.detail.avatar,
    email: item.detail.mail,
    phoneNumber: item.detail.phonenumber,
    location: item.detail.location,
    totalPhotoSold: item.totalPhotoSale,
  }));
  return (
    <div className="bg-[#32353b] rounded-sm">
      <div className="flex items-center justify-center p-4 font-bold text-[#eee]">
        Danh sách xếp hạng các nhiếp ảnh gia bán được nhiều ảnh
      </div>
      <Table
        // loading={isLoading}
        columns={columns}
        dataSource={dataPhotographers}
        // onChange={onChange}
        scroll={{
          x: 1020, // Chiều rộng để bảng cuộn ngang nếu nội dung vượt quá
          y: "50vh", // Chiều cao cố định để bảng cuộn dọc
        }}
        pagination={false}
        showSorterTooltip={{
          target: "sorter-icon",
        }}
      />
    </div>
  );
};

export default TablePhotographersList;

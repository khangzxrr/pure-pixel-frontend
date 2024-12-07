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
import formatPrice from "./../../utils/FormatPriceUtils";
import { FormatDate } from "./../../utils/FormatDate";
const TablePhotoshootOfPhotographer = ({ data }) => {
  console.log(data);

  const navigate = useNavigate();
  const columns = [
    {
      title: "Xếp hạng",
      dataIndex: "photoshootRank",
      render: (_, __, index) => <span>{index + 1}</span>,
      width: 125,
    },
    {
      title: "Tên",
      dataIndex: "name",
      width: 300,
      render: (text, record) => (
        <div className="flex items-center gap-2">
          <div className="size-16 overflow-hidden">
            <img
              src={record.thumbnail}
              alt=""
              className="size-full object-cover"
            />
          </div>
          {text}
        </div>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdDate",
    },
    { title: "Giá", dataIndex: "price" },
    {
      title: "Tổng số lượt đặt",
      dataIndex: "totalPhotoshootBooking",
      render: (text, record) => <div>{text} lượt đặt</div>,
      width: 150,
    },
  ];

  const dataPhotoshootPackages = data.map((item) => {
    return {
      key: item.id,
      thumbnail: item.thumbnail,
      name: item.title,
      photoshootRank: item.photoshootRank,
      createdDate: FormatDate(item.createdAt),
      price: formatPrice(item.price),
      totalPhotoshootBooking: item._count?.bookings,
    };
  });
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

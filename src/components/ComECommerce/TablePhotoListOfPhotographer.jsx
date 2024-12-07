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
import { FormatDate } from "./../../utils/FormatDate";
const TablePhotoListOfPhotographer = ({ data }) => {
  const navigate = useNavigate();

  const columns = [
    {
      title: "Xếp hạng",
      dataIndex: "photoRank",
      render: (_, __, index) => <span>{index + 1}</span>,
      width: 120,
    },
    {
      title: "Tên",
      dataIndex: "name",
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
      width: 240,
    },
    {
      title: "Tổng số ảnh đã bán",
      dataIndex: "totalPhotoSold",
      width: 240,
      render: (text, record) => <div>{text} ảnh</div>,
    },
  ];

  const dataPhotographers = data?.map((item) => ({
    name: item.detail?.title,
    thumbnail: item.detail?.signedUrl?.thumbnail,
    createdDate: FormatDate(item.detail?.createdAt),
    totalPhotoSold: item.soldCount,
  }));
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

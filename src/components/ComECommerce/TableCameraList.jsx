import React from "react";
import {
  ConfigProvider,
  message,
  Modal,
  notification,
  Pagination,
  Table,
} from "antd";
const TableCameraList = ({ dataCamera }) => {
  console.log(dataCamera);

  const columns = [
    {
      title: "Xếp hạng",
      dataIndex: "index",
      key: "index",
      render: (text, record, index) => index + 1,
      width: 100,
    },
    {
      title: "Logo",
      dataIndex: "logo",
      render: (text, record, index) => (
        <div className="size-16 overflow-hidden">
          <img src={text} alt="" className="bg-[#eee] size-full object-cover" />
        </div>
      ),
      width: 100,
    },
    {
      title: "Tên máy ảnh",
      dataIndex: "name",
      key: "name",
      width: 120,
    },
    {
      title: "Các mã phổ biến",
      dataIndex: "modalCamera",
      render: (text, record) =>
        record?.modal?.map((item) => item.name).join(", "),
      width: 150,
    },
    {
      title: "Số người dùng sử dụng",
      dataIndex: "userCount",
      width: 150,
    },
  ];

  const dataCameraList = dataCamera?.map((item, index) => ({
    index: index + 1,
    name: item?.maker.name,
    logo: item?.maker.thumbnail,
    userCount: item?.userCount,
    modal: item?.maker.cameras,
  }));

  return (
    <div className="bg-[#32353b] rounded-sm flex flex-col col-span-5">
      <div className="text-center font-bold p-4 text-[#eee]">
        Danh sách xếp hạng các máy ảnh phổ biến nhất
      </div>
      <Table
        // loading={isLoading}
        columns={columns}
        dataSource={dataCameraList}
        // onChange={onChange}
        scroll={{
          x: 900, // Chiều rộng để bảng cuộn ngang nếu nội dung vượt quá
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

export default TableCameraList;

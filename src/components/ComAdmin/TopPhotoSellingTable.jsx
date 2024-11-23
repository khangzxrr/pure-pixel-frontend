import React from "react";
import { Table } from "antd";
import "./LightThemeTable.css";
import { FormatDateTime } from "./../../utils/FormatDateTimeUtils";
import { useQuery } from "@tanstack/react-query";
import PhotoApi from "../../apis/PhotoApi";
const TopPhotoSellingTable = ({ photoBestSold }) => {
  const photoId = photoBestSold.map((item) => item.photo.photoId);

  const {
    data: photoList,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["photos", photoId],
    queryFn: async () => {
      const responses = await Promise.all(
        photoId.map((id) => PhotoApi.getPhotoById(id))
      );
      return responses; // Trả về danh sách các ảnh
    },
  });
  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (isError) {
    return <div>Error: {error.message}</div>;
  }
  const columns = [
    {
      title: "ID ảnh",
      dataIndex: "photoId",
    },
    {
      title: "Hình ảnh",
      dataIndex: "thumbnail",
      width: 200,
      render: (photoUrl) => (
        // Assuming photoUrl is the URL to the image thumbnail
        <img src={photoUrl} alt="Photo Thumbnail" width="50" height="50" />
      ),
    },
    {
      title: "Ngày đăng",
      dataIndex: "createdAt",
    },
    {
      title: "Loại ảnh",
      dataIndex: "photoType",
    },
    {
      title: "Tổng số ảnh đã bán",
      dataIndex: "totalPhotoSold",
    },
  ];
  const data = photoBestSold.map((item) => {
    const photo = photoList.find((photo) => photo.id === item.photo.photoId);
    return {
      photoId: item.photo.id,
      thumbnail: photo?.signedUrl.url,
      createdAt: FormatDateTime(item.photo.createdAt),
      photoType: photo.photoType,
      totalPhotoSold: item.totalSelled,
    };
  });
  const onChange = (pagination, filters, sorter, extra) => {
    console.log("params", pagination, filters, sorter, extra);
  };

  return (
    <Table
      columns={columns}
      dataSource={data}
      onChange={onChange}
      showSorterTooltip={{
        target: "sorter-icon",
      }}
      className="light-theme-table"
      scroll={{
        x: 1020, // Chiều rộng để bảng cuộn ngang nếu nội dung vượt quá
        y: "65vh", // Chiều cao cố định để bảng cuộn dọc
      }}
    />
  );
};

export default TopPhotoSellingTable;

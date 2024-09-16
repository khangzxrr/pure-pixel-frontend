import React, { useState } from "react";
import { DownOutlined } from "@ant-design/icons";
import { Dropdown, Space } from "antd";
import DailyDoseItem from "./DailyDoseItem";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../../LoadingSpinner/LoadingSpinner";
import InfiniteScroll from "react-infinite-scroll-component";
import { useInfiniteQuery } from "@tanstack/react-query";
import PhotoApi from "../../../apis/PhotoApi";

const ForYou = () => {
  const navigate = useNavigate();
  const limit = 60; // Giới hạn tổng số ảnh
  const take = 20; // Số lượng ảnh mỗi lần load

  // Sử dụng useInfiniteQuery từ react-query (v5) với object form
  const { data, fetchNextPage, hasNextPage, isLoading, isError, error } =
    useInfiniteQuery({
      queryKey: ["public-photos"],
      queryFn: async ({ pageParam = 0 }) => {
        // Gọi API để lấy ảnh dựa trên skip (pageParam) và take
        const response = await PhotoApi.getPublicPhotos(pageParam, take);
        return response;
      },
      getNextPageParam: (lastPage, allPages) => {
        const totalLoadedPhotos = allPages.flat().length;
        if (totalLoadedPhotos >= limit) return undefined;
        return totalLoadedPhotos;
      },
    });

  // Kiểm tra nếu đang loading hoặc có lỗi
  if (isLoading) {
    return (
      <div className="flex justify-center mt-4">
        <LoadingSpinner />
      </div>
    );
  }

  if (isError) {
    return <div>Lỗi: {error.message}</div>;
  }

  // Lấy danh sách các ảnh đã tải
  const photoList = data.pages.flat();

  return (
    <div className=" ">
      <div className="flex justify-between items-center px-6">
        <div className="ml-6 hover:cursor-pointer hover:font-bold">
          <Dropdown
            className="hover:cursor-pointer"
            menu={{
              items: DailyDoseItem,
            }}
            trigger={["click"]}
          >
            <a onClick={(e) => e.preventDefault()}>
              <Space>
                Daily dose
                <DownOutlined />
              </Space>
            </a>
          </Dropdown>
        </div>
      </div>

      <InfiniteScroll
        dataLength={photoList.length}
        next={fetchNextPage}
        hasMore={hasNextPage}
        loader={
          <div className="flex justify-center mt-4">
            <LoadingSpinner />
          </div>
        }
        endMessage={
          <p style={{ textAlign: "center", marginTop: "20px" }}>
            <b>Bạn đã xem hết ảnh ngày hôm nay</b>
          </p>
        }
      >
        <div className="max-w-8xl px-12 py-2 pb-10 mx-auto mb-10 gap-5 columns-4 space-y-5 relative">
          {photoList.map((photo) => (
            <div
              key={photo.id}
              className="overflow-hidden rounded-xl hover:cursor-pointer "
            >
              <img
                key={photo.id}
                src={photo.signedUrl.thumbnail}
                alt={`Photo ${photo.id}`}
                className="rounded-xl transition-transform duration-300 ease-in-out transform hover:scale-110 w-full h-full object-cover"
                onClick={() => navigate(`/for-you/${photo.id}`)}
              />
            </div>
          ))}
        </div>
      </InfiniteScroll>
    </div>
  );
};

export default ForYou;

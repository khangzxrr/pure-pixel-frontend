import React from "react";
import { DownOutlined } from "@ant-design/icons";
import { Dropdown, Space } from "antd";
import DailyDoseItem from "./DailyDoseItem";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../../LoadingSpinner/LoadingSpinner";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import PhotoApi from "../../../apis/PhotoApi";
import InfiniteScroll from "react-infinite-scroll-component";
import Masonry from "react-masonry-css";

const ForYou = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const limit = 90; // Tổng số ảnh
  const take = 10; // Số lượng ảnh load mỗi lần

  const fetchPhotos = async ({ pageParam = 0 }) => {
    const response = await PhotoApi.getPublicPhotos(pageParam, take);
    return response;
  };

  const { data, isLoading, isError, error, fetchNextPage, hasNextPage } =
    useInfiniteQuery({
      queryKey: ["public-photos"],
      queryFn: fetchPhotos,
      getNextPageParam: (lastPage, allPages) => {
        const nextSkip = allPages.length * take;
        return nextSkip < limit ? nextSkip : undefined;
      },
    });

  if (isLoading && !data) {
    return (
      <div className="flex justify-center mt-4">
        <LoadingSpinner />
      </div>
    );
  }

  if (isError) {
    return <div>Lỗi: {error.message}</div>;
  }

  // Merge all pages' results
  const photoList = data.pages.flat();

  // Breakpoint columns for screen size
  const breakpointColumnsObj = {
    default: 5,
    1100: 3,
    700: 2,
    500: 1,
  };

  const handleOnClick = (id) => {
    //clear cache before navigate to photo detail
    queryClient.invalidateQueries({ queryKey: ["get-photo-by-id"] });
    navigate(`/for-you/${id}`);
  };

  return (
    <div className="py-5">
      <div className="flex justify-between items-center px-2 pb-3">
        <div className="ml-6 hover:cursor-pointer">
          <Dropdown
            className="hover:cursor-pointer"
            menu={{ items: DailyDoseItem }}
            trigger={["click"]}
          >
            <a onClick={(e) => e.preventDefault()}>
              <Space>
                Ảnh hằng ngày
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
        endMessage={<p className="text-center">Không còn ảnh nào nữa</p>}
      >
        <div className="px-6">
          {/* <Masonry
            breakpointCols={breakpointColumnsObj}
            className="my-masonry-grid"
            columnClassName="my-masonry-grid_column"
          > */}
          {photoList.map((photo) => (
            <div
              key={photo.id}
              className="relative overflow-hidden rounded-xl hover:cursor-pointer group"
              onClick={() => handleOnClick(photo.id)}
            >
              {/* Image */}
              <img
                src={photo.signedUrl.thumbnail}
                alt={`Photo ${photo.id}`}
                className="rounded-xl w-full h-auto object-cover transition-transform duration-300 ease-in-out transform group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent text-white text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-[30px] h-[30px] overflow-hidden rounded-full">
                      <img
                        src="https://vnn-imgs-a1.vgcloud.vn/image1.ictnews.vn/_Files/2020/03/17/trend-avatar-1.jpg"
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>{photo.title || "Tên tác giả"}</div>
                  </div>
                  <div>{photo.title || "Tiêu đề"}</div>
                </div>
              </div>
            </div>
          ))}
          {/* </Masonry> */}
        </div>
      </InfiniteScroll>
    </div>
  );
};

export default ForYou;

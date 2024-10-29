import React from "react";
import PhotographerCard from "../../components/Photographer/PhotographerList/PhotographerCard";
import InfiniteScroll from "react-infinite-scroll-component";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
import { useInfiniteQuery } from "@tanstack/react-query";
import PhotographerApi from "../../apis/PhotographerApi";

const ListPhotographers = () => {
  const { data, fetchNextPage, hasNextPage, isLoading, isError, error } =
    useInfiniteQuery({
      queryKey: ["photographers"],
      queryFn: ({ pageParam = 0 }) =>
        PhotographerApi.getAllPhotographers(10, pageParam),
      getNextPageParam: (lastPage, allPages) => {
        // Kiểm tra số trang đã tải và tổng số bản ghi
        const totalRecords = lastPage.totalRecord; // Tổng số bản ghi từ API
        const totalPages = lastPage.totalPage; // Tổng số trang từ API
        const currentPage = allPages.length; // Số trang đã tải

        // Nếu trang hiện tại nhỏ hơn tổng số trang, có thể tải thêm
        return currentPage < totalPages ? currentPage : undefined;
      },
    });

  const photographers = data?.pages.flatMap((page) => page.objects) || [];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center text-red-500">
        Không thể tải danh sách đang theo dõi: {error.message}
      </div>
    );
  }

  return (
    <div id="" className="flex flex-col px-2 py-1">
      <div className="text-center my-2">
        <div className="text-xl font-bold">Bạn chưa theo dõi ai cả</div>
        <div className="font-normal">
          Bắt đầu theo dõi các nhiếp ảnh gia và cập nhật những bức ảnh mới nhất
          của họ tại đây!
        </div>
      </div>

      <InfiniteScroll
        dataLength={photographers.length}
        next={fetchNextPage}
        hasMore={hasNextPage}
        loader={
          <div className="flex justify-center py-4">
            <LoadingSpinner />
          </div>
        }
        scrollableTarget="inspiration"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 py-3 "
      >
        {photographers.map((photographer) => (
          <PhotographerCard
            key={photographer.id}
            id={photographer.id}
            name={photographer.name}
            avatar={photographer.avatar}
            quote={photographer.quote}
          />
        ))}
      </InfiniteScroll>
    </div>
  );
};

export default ListPhotographers;

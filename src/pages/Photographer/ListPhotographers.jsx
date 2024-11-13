import React from "react";
import PhotographerCard from "../../components/Photographer/PhotographerList/PhotographerCard";
import InfiniteScroll from "react-infinite-scroll-component";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
import { useInfiniteQuery } from "@tanstack/react-query";
import PhotographerApi from "../../apis/PhotographerApi";
import { useKeycloak } from "@react-keycloak/web";
import UserService from "../../services/Keycloak";
import UsePhotographerFilterStore from "../../states/UsePhotographerFilterStore";
import FollowApi from "../../apis/FollowApi";

const ListPhotographers = () => {
  const { keyloack } = useKeycloak();
  const userData = UserService.getTokenParsed();
  const userId = userData?.sub;

  const filterByVote = UsePhotographerFilterStore(
    (state) => state.filterByVote
  );
  const searchResult = UsePhotographerFilterStore(
    (state) => state.searchResult
  );
  const orderByVoteCount = filterByVote.param;
  const photographerName = searchResult;
  const { data, fetchNextPage, hasNextPage, isLoading, isError, error } =
    useInfiniteQuery({
      queryKey: ["photographers", searchResult, filterByVote],
      queryFn: ({ pageParam = 0 }) =>
        PhotographerApi.getAllPhotographers(
          10,
          pageParam,
          photographerName,
          null,
          orderByVoteCount
        ),
      getNextPageParam: (lastPage, allPages) => {
        const totalRecords = lastPage.totalRecord;
        const totalPages = lastPage.totalPage;
        const currentPage = allPages.length;

        return currentPage < totalPages ? currentPage : undefined;
      },
    });

  const {
    data: dataFollower,
    fetchNextPage: fetchNextPageFollower,
    hasNextPage: hasNextPageFollower,
    isLoading: isLoadingFollower,
    isError: isErrorFollower,
    error: errorFollower,
  } = useInfiniteQuery({
    queryKey: ["followers-me"],
    queryFn: ({ pageParam = 0 }) => FollowApi.getAllFolllowerMe(10, pageParam),
    getNextPageParam: (lastPage, allPages) => {
      const totalRecords = lastPage.totalRecord; // Tổng số bản ghi từ API
      const totalPages = lastPage.totalPage; // Tổng số trang từ API
      const currentPage = allPages.length; // Số trang đã tải

      return currentPage < totalPages ? currentPage : undefined;
    },
  });
  const listFollowers = dataFollower?.pages.flatMap((page) => page.objects);
  console.log("listFollowers", listFollowers);

  const photographers =
    data?.pages
      .flatMap((page) => page.objects)
      .filter((photographer) => photographer.id !== userId) || [];

  return (
    <div id="" className="flex flex-col px-2 py-1 h-screen">
      {listFollowers && listFollowers.length < 1 && (
        <div className="text-center my-2">
          <div className="text-xl font-bold">Bạn chưa theo dõi ai cả</div>
          <div className="font-normal">
            Bắt đầu theo dõi các nhiếp ảnh gia và cập nhật những bức ảnh mới
            nhất của họ tại đây!
          </div>
        </div>
      )}

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
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4  gap-6 py-3 "
      >
        {isLoading && (
          <div className="flex justify-center col-span-4">
            <LoadingSpinner />
          </div>
        )}
        {isError && <div>{error.message}</div>}
        {!isLoading &&
          !isError &&
          photographers.map((photographer) => (
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

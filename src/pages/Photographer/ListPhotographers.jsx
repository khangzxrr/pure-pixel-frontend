import React from "react";
import PhotographerCard from "../../components/Photographer/PhotographerList/PhotographerCard";
import InfiniteScroll from "react-infinite-scroll-component";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
import { useInfiniteQuery } from "@tanstack/react-query";
import PhotographerApi from "../../apis/PhotographerApi";
import { useKeycloak } from "@react-keycloak/web";
import UsePhotographerFilterStore from "../../states/UsePhotographerFilterStore";
import FollowApi from "../../apis/FollowApi";
import { MdPersonOff } from "react-icons/md";

const ListPhotographers = () => {
  const { keycloak } = useKeycloak();

  const userId = keycloak.tokenParsed?.sub;

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
      queryKey: ["photographers", searchResult, filterByVote, userId],
      queryFn: ({ pageParam = 0 }) =>
        PhotographerApi.getAllPhotographers(
          10,
          pageParam,
          photographerName,
          null,
          orderByVoteCount,
          null,
          "desc"
        ),
      getNextPageParam: (lastPage, allPages) => {
        const totalPages = lastPage.totalPage;
        const currentPage = allPages.length;

        return currentPage < totalPages ? currentPage : undefined;
      },
    });

  const photographers =
    data?.pages
      .flatMap((page) => page.objects)
      .filter((photographer) => photographer.id !== userId) || [];

  return (
    <div id="" className="flex flex-col px-2 py-1 h-screen">
      {/* <div className="text-center my-2">
        <div className="text-xl font-bold">Bạn chưa theo dõi ai cả</div>
        <div className="font-normal">
          Bắt đầu theo dõi các nhiếp ảnh gia và cập nhật những bức ảnh mới nhất
          của họ tại đây!
        </div>
      </div> */}

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
        {!isLoading && !isError && photographers.length > 0 ? (
          photographers.map((photographer) => (
            <PhotographerCard
              //  key={photographer.id}
              photographer={photographer}
            />
          ))
        ) : (
          <div className="col-span-4 flex items-center justify-center h-[500px]">
            <div className="flex flex-col items-center text-gray-400">
              <MdPersonOff className="text-6xl" />
              Không tìm thấy nhiếp ảnh gia khả dụng!
            </div>
          </div>
        )}
      </InfiniteScroll>
    </div>
  );
};

export default ListPhotographers;

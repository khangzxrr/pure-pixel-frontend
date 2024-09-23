import React from "react";
import PhotoApi from "../../../apis/PhotoApi";
import { useNavigate } from "react-router-dom";
import { useInfiniteQuery } from "@tanstack/react-query";
import LoadingSpinner from "../../LoadingSpinner/LoadingSpinner";
import InfiniteScroll from "react-infinite-scroll-component";
import Masonry from "react-masonry-css";

const InspirationPhoto = () => {
  const navigate = useNavigate();
  const limit = 99; // Tổng số ảnh
  const take = 20; // Số lượng ảnh load mỗi lần

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
    default: 4,
    1100: 3,
    700: 2,
    500: 1,
  };

  const handleOnClick = (id) => {
    navigate(`/photo/${id}`);
  };

  return (
    <div className="">
      <div>
        <InfiniteScroll
          dataLength={photoList.length}
          next={fetchNextPage}
          hasMore={hasNextPage}
          scrollThreshold={0.8}
          scrollableTarget="inspiration"
          loader={
            <div className="flex justify-center mt-4">
              <LoadingSpinner />
            </div>
          }
          endMessage={<p className="text-center">Không còn ảnh nào nữa</p>}
        >
          <div className="p-[5px]">
            <Masonry
              breakpointCols={breakpointColumnsObj}
              className="my-masonry-grid"
              columnClassName="my-masonry-grid_column"
            >
              {photoList.map((photo) => (
                <div
                  key={photo.id}
                  className="group relative overflow-hidden hover:cursor-pointer hover:shadow-[0_4px_30px_rgba(0,0,0,0.8)] transition-shadow duration-300"
                  onClick={() => handleOnClick(photo.id)}
                >
                  <img
                    src={photo.signedUrl.thumbnail}
                    alt={`Photo ${photo.id}`}
                    className="w-full h-auto object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 backdrop-blur-sm text-white text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center h-16 ">
                    <div className="flex justify-between w-full px-3">
                      <div className="flex items-center gap-2">
                        <div className="size-7 rounded-full overflow-hidden outline outline-1 outline-white">
                          <img
                            src={photo.photographer.avatar}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>{photo.photographer.name || "Tên tác giả"}</div>
                      </div>
                      <div>{photo.title || "Không tên"}</div>
                    </div>
                  </div>
                </div>
              ))}
            </Masonry>
          </div>
        </InfiniteScroll>
      </div>
    </div>
  );
};

export default InspirationPhoto;

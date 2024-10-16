import React, { useState } from "react";
import PhotoApi from "../../../apis/PhotoApi";
import { useNavigate } from "react-router-dom";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import LoadingSpinner from "../../LoadingSpinner/LoadingSpinner";
import InfiniteScroll from "react-infinite-scroll-component";
import Masonry from "react-masonry-css";
import { FaRegHeart } from "react-icons/fa6";
import { FiShare2 } from "react-icons/fi";
import DetailedPhotoView from "../../../pages/DetailPhoto/DetailPhoto";
import { useKeycloak } from "@react-keycloak/web";
import UseCategoryStore from "../../../states/UseCategoryStore";
import InsPhotoFilter from "./InsPhotoFilter";

const InspirationPhoto = () => {
  const { keycloak } = useKeycloak();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const limit = 20; // Tổng số ảnh
  const [selectedImage, setSelectedImage] = useState(null);

  const selectedPhotoCategory = UseCategoryStore(
    (state) => state.selectedPhotoCategory
  );
  const filterByPhotoDate = UseCategoryStore(
    (state) => state.filterByPhotoDate
  );
  const { isWatermarkChecked, isForSaleChecked } = UseCategoryStore();
  const filterByUpVote = UseCategoryStore((state) => state.filterByUpVote);
  const searchResult = UseCategoryStore((state) => state.searchResult);
  const searchByPhotoTitle = UseCategoryStore(
    (state) => state.searchByPhotoTitle
  );
  // const searchCategory = UseCategoryStore((state) => state.searchCategory);

  const fetchPhotos = async ({ pageParam = 0 }) => {
    const validLimit = Math.max(1, Math.min(limit, 9999));
    const validPage = Math.max(0, Math.min(pageParam, 9999));
    const categoryName = selectedPhotoCategory.name;
    const orderByCreatedAt = filterByPhotoDate.param;
    const orderByUpVote = filterByUpVote.param;
    const watermark = isWatermarkChecked;
    const selling = isForSaleChecked;
    const photographerName = searchResult;
    const title = searchByPhotoTitle;
    const response = await PhotoApi.getPublicPhotos(
      validLimit,
      validPage,
      categoryName,
      orderByCreatedAt,
      orderByUpVote,
      watermark,
      selling,
      photographerName,
      title
    );
    return response;
  };

  const { data, isLoading, isError, error, fetchNextPage, hasNextPage } =
    useInfiniteQuery({
      queryKey: [
        "public-photos",
        selectedPhotoCategory,
        filterByPhotoDate,
        filterByUpVote,
        isWatermarkChecked,
        isForSaleChecked,
        searchResult,
        searchByPhotoTitle,
      ],
      queryFn: fetchPhotos,
      getNextPageParam: (lastPage, pages) => {
        // Số trang đã fetch
        const currentPage = pages.length;
        // Trả về số trang tiếp theo nếu còn ảnh
        return currentPage < lastPage.totalPage ? currentPage : undefined;
      },
    });

  // if (isLoading && !data) {
  //   return (
  //     <div className="flex justify-center mt-4">
  //       <LoadingSpinner />
  //     </div>
  //   );
  // }

  // if (isError) {
  //   return <div>Lỗi: {error.message}</div>;
  // }

  // Merge all pages' results
  // const photoList = data.pages.flatMap((page) => page.objects);
  const photoList = data?.pages
    ? data.pages.flatMap((page) => page.objects)
    : [];

  // Breakpoint columns for screen size
  const breakpointColumnsObj = {
    default: 4,
    1100: 3,
    700: 2,
    500: 1,
  };

  const handleOnClick = (id) => {
    queryClient.invalidateQueries({ queryKey: ["get-photo-by-id"] });
    setSelectedImage(id);
    // navigate(`/photo/${id}`, { state: { listImg: photoList } });
  };

  return (
    <>
      {selectedImage && (
        <DetailedPhotoView
          idImg={selectedImage}
          onClose={() => {
            navigate(`/explore/inspiration`);
            setSelectedImage(null);
          }}
          listImg={photoList}
        />
      )}

      <div>
        <div className="font-normal flex mx-3 my-2 items-center flex-col sm:flex-row">
          Bộ lọc ảnh theo tiêu chí: <InsPhotoFilter />
        </div>
        <div>
          {isLoading && (
            <div className="flex justify-center mt-4">
              <LoadingSpinner />
            </div>
          )}
          {isError && (
            <div className="text-center text-red-500">Lỗi: {error.message}</div>
          )}

          {!isLoading && !isError && photoList.length > 0 && (
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
                    >
                      <img
                        src={photo.signedUrl.thumbnail}
                        alt={`Photo ${photo.id}`}
                        className="w-full h-auto object-cover"
                        onClick={() => handleOnClick(photo.id)}
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
                            <div>
                              {photo.photographer.name || "Tên tác giả"}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              <FaRegHeart className="size-7" />
                              {photo._count?.votes || 0}
                            </div>
                            <div className="flex items-center gap-2">
                              <FiShare2 className="size-7" />
                              {0}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </Masonry>
              </div>
            </InfiniteScroll>
          )}
        </div>
      </div>
    </>
  );
};

export default InspirationPhoto;

import React, { useState } from "react";
import PhotoApi from "../../../apis/PhotoApi";
import { useNavigate } from "react-router-dom";
import { useInfiniteQuery } from "@tanstack/react-query";
import LoadingSpinner from "../../LoadingSpinner/LoadingSpinner";
import InfiniteScroll from "react-infinite-scroll-component";
import Masonry from "react-masonry-css";
import { FiShare2 } from "react-icons/fi";
import DetailedPhotoView from "../../../pages/DetailPhoto/DetailPhoto";
import UseCategoryStore from "../../../states/UseCategoryStore";
import { IoMdImages } from "react-icons/io";
import UsePhotographerFilterStore from "../../../states/UsePhotographerFilterStore";
import UseUserProfileStore from "../../../states/UseUserProfileStore";
import ComModal from "../../ComModal/ComModal";
import ComSharePhoto from "../../ComSharePhoto/ComSharePhoto";
import { useModalState } from "../../../hooks/useModalState";
import UseUserOtherStore from "./../../../states/UseUserOtherStore";

import LazyThumbnail from "../../ComLazyPhoto/LazyThumbnail";

const InspirationPhoto = () => {
  const navigate = useNavigate();
  const limit = 20; // Tổng số ảnh

  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

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
  const setNamePhotographer = UsePhotographerFilterStore(
    (state) => state.setNamePhotographer
  );
  const setUserOtherId = UseUserOtherStore((state) => state.setUserOtherId);
  const setActiveTitle = UseUserProfileStore((state) => state.setActiveTitle);
  const setNameUserOther = UseUserOtherStore((state) => state.setNameUserOther);
  const searchByTags = UseCategoryStore((state) => state.searchByTags);
  const filterByIsFollowed = UseCategoryStore(
    (state) => state.filterByIsFollowed
  );
  const popupShare = useModalState();

  const fetchPhotos = async ({ pageParam = 0 }) => {
    const validLimit = Math.max(1, Math.min(limit, 9999));
    const validPage = Math.max(0, Math.min(pageParam, 9999));
    const categoryName = selectedPhotoCategory.name;
    const orderByCreatedAt = filterByPhotoDate.param;
    const orderByUpVote = filterByUpVote.param;
    const isFollowed = filterByIsFollowed.param;
    const watermark = isWatermarkChecked;
    const selling = false;
    const photographerName = searchResult;
    const title = searchByPhotoTitle;
    // const tag = Array.isArray(searchByTags) ? searchByTags[0] : searchByTags;
    const tag = searchByTags;

    const response = await PhotoApi.getPublicPhotos(
      validLimit,
      validPage,
      categoryName,
      orderByCreatedAt,
      orderByUpVote,
      watermark,
      selling,
      photographerName,
      title,
      null,
      null,
      null,
      tag,
      isFollowed
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
        filterByIsFollowed,
        searchByTags,
      ],
      queryFn: fetchPhotos,
      getNextPageParam: (lastPage, pages) => {
        // Số trang đã fetch
        const currentPage = pages.length;
        // Trả về số trang tiếp theo nếu còn ảnh
        return currentPage < lastPage.totalPage ? currentPage : undefined;
      },
    });

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

  const handleOnClick = (photo) => {
    setSelectedImage(photo);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center mt-4">
        <LoadingSpinner />
      </div>
    );
  }
  return (
    <>
      <ComModal
        isOpen={popupShare.isModalOpen}
        onClose={popupShare.handleClose}
        // width={800}
        // className={"bg-black"}
      >
        <ComSharePhoto
          photoId={selectedPhoto?.id}
          userId={selectedPhoto?.photographer.id}
          onClose={popupShare.handleClose}
        />
      </ComModal>
      {selectedImage && (
        <DetailedPhotoView
          photo={selectedImage}
          idImg={selectedImage.id}
          onClose={() => {
            navigate(`/explore/inspiration`);
            setSelectedImage(null);
          }}
          onCloseToMap={() => {
            navigate(`/explore/photo-map`);
            setSelectedImage(null);
          }}
          listImg={photoList}
        />
      )}

      <div className="min-h-screen">
        <div>
          {isError && (
            <div className="text-center text-red-500">Lỗi: {error.message}</div>
          )}

          {!isLoading && !isError && photoList.length > 0 ? (
            <InfiniteScroll
              dataLength={photoList.length}
              next={fetchNextPage}
              hasMore={hasNextPage}
              scrollThreshold={0.5}
              scrollableTarget="inspiration"
              endMessage={<p className="text-center">Không còn ảnh nào nữa</p>}
            >
              <div className="p-[5px]">
                <Masonry
                  breakpointCols={breakpointColumnsObj}
                  className="my-masonry-grid"
                  columnClassName="my-masonry-grid_column"
                >
                  {photoList.map((photo) => (
                    <>
                      <div
                        key={photo.id}
                        className="group relative overflow-hidden hover:cursor-pointer hover:shadow-[0_4px_30px_rgba(0,0,0,0.8)] transition-shadow duration-300"
                      >
                        {/* <LazyThumbnail
                          key={photo.id}
                          src={photo.signedUrl.thumbnail}
                          photo={photo}
                          className="w-full h-auto object-cover "
                          onClick={() => handleOnClick(photo)}
                        /> */}
                        <img
                          src={photo.signedUrl.thumbnail}
                          alt={`Photo ${photo.id}`}
                          className="w-full h-auto object-cover"
                          onClick={() => handleOnClick(photo)}
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
                              <div
                                className="hover:underline cursor-pointer underline-offset-2"
                                onClick={() => {
                                  setNamePhotographer(photo.photographer.name);
                                  setNameUserOther(photo.photographer.name);
                                  setActiveTitle(null);
                                  navigate(
                                    `/user/${photo.photographer.id}/photos`
                                  );
                                  setUserOtherId(photo.photographer.id);
                                }}
                              >
                                {photo.photographer.name || "Tên tác giả"}
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-2">
                                <FiShare2
                                  className="size-7"
                                  onClick={() => {
                                    popupShare.handleOpen();
                                    setSelectedPhoto(photo);
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  ))}
                </Masonry>
              </div>
            </InfiniteScroll>
          ) : (
            <div className="flex justify-center items-center  h-[90vh] ">
              <div className="flex flex-col items-center text-[#8b8d91]">
                <IoMdImages className="text-[100px] " />
                <p className="select-none">Không tìm thấy ảnh khả dụng!</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default InspirationPhoto;

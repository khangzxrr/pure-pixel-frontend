import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import LoadingSpinner from "../LoadingSpinner/LoadingSpinner";

import { IoMdImages } from "react-icons/io";

import { FiShare2 } from "react-icons/fi";
import InfiniteScroll from "react-infinite-scroll-component";
import Masonry from "react-masonry-css";
import PhotoApi from "../../apis/PhotoApi";
import DetailedPhotoView from "../../pages/DetailPhoto/DetailPhoto";
import { useModalState } from "../../hooks/useModalState";
import ComModal from "../ComModal/ComModal";
import ComSharePhoto from "../ComSharePhoto/ComSharePhoto";

const PhotosUser = () => {
  const { userId } = useParams();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const limit = 20;
  const popupShare = useModalState();

  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  const fetchPhotos = async ({ pageParam = 0 }) => {
    const validLimit = Math.max(1, Math.min(limit, 9999));
    const validPage = Math.max(0, Math.min(pageParam, 9999));

    const photographerId = userId;
    const response = await PhotoApi.getPublicPhotos(
      validLimit,
      validPage,
      null,
      null,
      null,
      null,
      false,
      null,
      null,
      photographerId,
      null
    );
    return response;
  };
  const { data, error, isLoading, isError, fetchNextPage, hasNextPage } =
    useInfiniteQuery({
      queryKey: ["user-photos", userId],
      queryFn: fetchPhotos,
      getNextPageParam: (lastPage, pages) => {
        const currentPage = pages.length;
        // Trả về số trang tiếp theo nếu còn ảnh
        return currentPage < lastPage.totalPage ? currentPage : undefined;
      },
    });

  const photoList = data?.pages
    ? data.pages.flatMap((page) => page.objects)
    : [];

  const breakpointColumnsObj = {
    default: 4,
    1100: 3,
    700: 2,
    500: 1,
  };
  const handleOnClick = (photo) => {
    queryClient.invalidateQueries({ queryKey: ["get-photo-by-id"] });
    setSelectedImage(photo);
  };
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
          userId={selectedPhoto?.photographer?.id}
          onClose={popupShare.handleClose}
        />
      </ComModal>
      {selectedImage && (
        <DetailedPhotoView
          photo={selectedImage}
          onClose={() => {
            navigate(`/user/${userId}/photos`);
            setSelectedImage(null);
          }}
        />
      )}
      {isLoading && (
        <div className="flex justify-center mt-4">
          <LoadingSpinner />
        </div>
      )}
      {isError && (
        <div className="text-center text-red-500">Lỗi: {error.message}</div>
      )}
      {!isLoading && !isError && photoList.length > 0 ? (
        <InfiniteScroll
          dataLength={photoList.length}
          next={fetchNextPage}
          hasMore={hasNextPage}
          scrollableTarget="main"
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
                    onClick={() => {
                      handleOnClick(photo);
                      console.log("PtUser", photo.id);
                    }}
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 backdrop-blur-sm text-white text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center h-16 ">
                    <div className="flex justify-between w-full px-3">
                      <div className="flex items-center gap-2">
                        <div className="truncate md:max-w-[150px] max-w-[100px]">
                          {photo.title || "Tên tác giả"}
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
    </>
  );
};

export default PhotosUser;

import { useKeycloak } from "@react-keycloak/web";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PhotoApi from "../../apis/PhotoApi";
import LoadingSpinner from "../LoadingSpinner/LoadingSpinner";
import InfiniteScroll from "react-infinite-scroll-component";
import Masonry from "react-masonry-css";
import { FaRegHeart } from "react-icons/fa";
import { FiShare2 } from "react-icons/fi";
import { IoMdImages } from "react-icons/io";
import DetailedPhotoView from "../../pages/DetailPhoto/DetailPhoto";
import ComModal from "../ComModal/ComModal";
import ComSharePhoto from "../ComSharePhoto/ComSharePhoto";
import { useModalState } from "../../hooks/useModalState";
import UseUserOtherStore from "../../states/UseUserOtherStore";
import UsePhotographerFilterStore from "../../states/UsePhotographerFilterStore";
import UseUserProfileStore from "../../states/UseUserProfileStore";
import useBeforeRouteDetailPhoto from "../../states/UseBeforeRouteDetailPhoto";

const CameraPhoto = ({ nameCamera }) => {
  const { keycloak } = useKeycloak();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const limit = 20;
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const popupShare = useModalState();
  const { cameraId } = useParams();
  const setUserOtherId = UseUserOtherStore((state) => state.setUserOtherId);
  const setActiveTitle = UseUserProfileStore((state) => state.setActiveTitle);
  const setNamePhotographer = UsePhotographerFilterStore(
    (state) => state.setNamePhotographer
  );
  const setNameUserOther = UseUserOtherStore((state) => state.setNameUserOther);
  const fetchPhotos = async ({ pageParam = 0 }) => {
    const validLimit = Math.max(1, Math.min(limit, 9999));
    const validPage = Math.max(0, Math.min(pageParam, 9999));
    const response = await PhotoApi.getPublicPhotos(
      validLimit,
      validPage,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      cameraId
    );
    return response;
  };

  const { data, isLoading, isError, error, fetchNextPage, hasNextPage } =
    useInfiniteQuery({
      queryKey: ["public-photos", cameraId],
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

  const breakpointColumnsObj = {
    default: 4,
    1100: 3,
    700: 2,
    500: 1,
  };
  const { setBeforeRoute } = useBeforeRouteDetailPhoto();

  const handleOnClick = (photo) => {
    queryClient.invalidateQueries({ queryKey: ["get-photo-by-id"] });
    setSelectedImage(photo);
    setBeforeRoute(`/explore/camera-model/${cameraId}`);
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
          userId={selectedPhoto?.photographer.id}
          onClose={popupShare.handleClose}
        />
      </ComModal>
      {selectedImage && (
        <DetailedPhotoView
          idImg={selectedImage.id}
          photo={selectedImage}
          onClose={() => {
            navigate(`/explore/camera-model/${cameraId}`);
            setSelectedImage(null);
          }}
          onCloseToMap={() => {
            navigate(`/explore/photo-map`);
            setSelectedImage(null);
          }}
          listImg={photoList}
        />
      )}

      <div>
        <div className="font-normal text-center my-2">
          Ảnh được chụp bởi{" "}
          <span className="font-bold">{nameCamera || ""}</span>
        </div>
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
            scrollableTarget="inspiration"
            loader={
              <div className="flex justify-center mt-4">
                <LoadingSpinner />
              </div>
            }
            // endMessage={<p className="text-center">Không còn ảnh nào nữa</p>}
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
                      onClick={() => handleOnClick(photo)}
                    />
                    {/* <BlurhashImage
                      src={photo.signedUrl.thumbnail}
                      height={photo.height}
                      width={photo.width}
                      className="w-full h-auto object-cover"
                      onClick={() => handleOnClick(photo.id)}
                    /> */}
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
                              navigate(`/user/${photo.photographer.id}/photos`);
                              setUserOtherId(photo.photographer.id);
                            }}
                          >
                            {photo.photographer.name || "Tên tác giả"}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {/* <div className="flex items-center gap-2">
                            <FaRegHeart className="size-7" />
                            {photo._count?.votes || 0}
                          </div> */}
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
      </div>
    </>
  );
};

export default CameraPhoto;

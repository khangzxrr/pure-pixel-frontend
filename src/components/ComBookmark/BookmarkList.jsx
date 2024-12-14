import React, { useState } from "react";
import BookmarkCard from "./BookmarkCard";
import PhotoApi from "../../apis/PhotoApi";
import { useQuery } from "@tanstack/react-query";
import { ConfigProvider, Pagination } from "antd";
import DetailedPhotoView from "../../pages/DetailPhoto/DetailPhoto";
import { useNavigate } from "react-router-dom";
import { useModalState } from "../../hooks/useModalState";
import ComSharePhoto from "../ComSharePhoto/ComSharePhoto";
import ComModal from "./../ComModal/ComModal";
import useBeforeRouteDetailPhoto from "../../states/UseBeforeRouteDetailPhoto";

const BookmarkList = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const itemsPerPage = 12;
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  const popupShare = useModalState();
  const bookmark = true;
  const { data, isFetching, isError, error } = useQuery({
    queryKey: ["getAllBookmarks", page],
    queryFn: () =>
      PhotoApi.getPublicPhotos(
        itemsPerPage,
        page - 1,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        bookmark
      ),
    keepPreviousData: true,
  });

  const listBookmarks = data?.objects || [];

  const totalPages = data?.totalPage || 1;
  const handlePageClick = (pageNumber) => {
    if (pageNumber !== page) {
      setPage(pageNumber);
    }
  };
  const { setBeforeRoute } = useBeforeRouteDetailPhoto();

  const handleOnClick = (photo) => {
    setBeforeRoute("/profile/bookmark");
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
          userId={selectedPhoto?.photographer.id}
          onClose={popupShare.handleClose}
        />
      </ComModal>
      {selectedImage && (
        <DetailedPhotoView
          photo={selectedImage}
          idImg={selectedImage.id}
          onClose={() => {
            navigate(`/profile/bookmark`);
            setSelectedImage(null);
          }}
          onCloseToMap={() => {
            navigate(`/explore/photo-map`);
            setSelectedImage(null);
          }}
          listImg={listBookmarks}
        />
      )}
      <ConfigProvider
        theme={{
          token: {
            colorBgContainer: "#1e1e1e",
            colorText: "#b3b3b3",
            colorPrimary: "white",
            colorBgTextHover: "#333333",
            colorBgTextActive: "#333333",
            colorTextDisabled: "#666666",
          },
        }}
      >
        <div className="flex flex-col gap-2">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 place-items-stretch gap-3">
            {listBookmarks.map((item) => (
              <BookmarkCard
                photoBookmark={item}
                onClick={() => handleOnClick(item)}
                onShare={() => {
                  popupShare.handleOpen();
                  setSelectedPhoto(item);
                }}
              />
            ))}
          </div>
        </div>
        {totalPages > 1 && (
          <Pagination
            current={page}
            total={totalPages * itemsPerPage}
            onChange={handlePageClick}
            pageSize={itemsPerPage}
            showSizeChanger={false}
            className="flex justify-end my-2"
          />
        )}
      </ConfigProvider>
    </>
  );
};

export default BookmarkList;

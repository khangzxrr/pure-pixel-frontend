import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import PhotographerApi from "../../apis/PhotographerApi";
import LoadingSpinner from "../LoadingSpinner/LoadingSpinner";
import DetailedPhotoView from "../../pages/DetailPhoto/DetailPhoto";
import { useNavigate } from "react-router-dom";
import MyPhotoFilter from "./MyPhotoFilter";
import UseMyPhotoFilter from "../../states/UseMyPhotoFilter";

const MyPhotoP = () => {
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(null);
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  const filterByPhotoDate = UseMyPhotoFilter(
    (state) => state.filterByPhotoDate
  );
  const searchResult = UseMyPhotoFilter((state) => state.searchResult);
  const searchPhoto = searchResult;
  const orderByCreatedAt = filterByPhotoDate.param;
  const filterByUpVote = UseMyPhotoFilter((state) => state.filterByUpVote);
  const orderByUpVote = filterByUpVote.param;
  const { isWatermarkChecked, isForSaleChecked } = UseMyPhotoFilter();
  const watermark = isWatermarkChecked;
  const selling = isForSaleChecked;
  const { data, isFetching, isError, error } = useQuery({
    queryKey: [
      "my-photo",
      page,
      filterByPhotoDate,
      filterByUpVote,
      isWatermarkChecked,
      isForSaleChecked,
      searchResult,
    ],
    queryFn: () =>
      PhotographerApi.getMyPhotos(
        itemsPerPage,
        page - 1,
        orderByCreatedAt,
        orderByUpVote,
        watermark,
        selling,
        searchPhoto
      ),
    keepPreviousData: true,
  });

  const handleOnClick = (id) => {
    setSelectedImage(id);
  };

  const totalPages = data?.totalPage || 1;

  const handlePageClick = (pageNumber) => {
    if (pageNumber !== page) {
      setPage(pageNumber);
    }
  };
  // console.log(data.objects);

  return (
    <>
      {selectedImage && (
        <DetailedPhotoView
          idImg={selectedImage}
          onClose={() => {
            navigate(`/profile/my-photos`);
            setSelectedImage(null);
          }}
          listImg={data.objects}
        />
      )}
      <div className="my-2">
        <MyPhotoFilter />
      </div>
      <div className="flex flex-col min-h-screen py-2 bg-[#2f3136]">
        {/* Pagination Top */}
        <div className="flex justify-center gap-2 mx-5 my-2">
          {Array.from({ length: totalPages }, (_, index) => index + 1).map(
            (pageNumber) => (
              <button
                key={pageNumber}
                onClick={() => handlePageClick(pageNumber)}
                className={`px-3 py-1 rounded ${
                  page === pageNumber
                    ? "bg-[#eee] text-gray-600"
                    : "bg-gray-600 text-white"
                }`}
              >
                {pageNumber}
              </button>
            )
          )}
        </div>

        {/* Photos Display */}
        <div className="grid grid-cols-4 gap-2 mx-2">
          {isError && (
            <div className="text-red-500">{JSON.stringify(error)}</div>
          )}
          {isFetching ? (
            <div className="flex justify-center w-full">
              <LoadingSpinner />
            </div>
          ) : data?.objects.length > 0 ? (
            data.objects.map((photo) => (
              <div key={photo.id} className="relative group">
                <div className="w-full h-[320px] overflow-hidden">
                  <img
                    className="w-full h-full object-cover"
                    src={photo.signedUrl.thumbnail}
                    alt={photo.title || "Ảnh"}
                    onClick={() => handleOnClick(photo.id)}
                  />
                </div>
                <div className="absolute bottom-0 left-0 w-full bg-black bg-opacity-50 text-white text-center py-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-md">
                  <div className="flex justify-between px-1">
                    <div>{photo.title || "Không xác định"}</div>
                    <div>{photo.category.name || "Không xác định"}</div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-white text-center w-full">
              Không có ảnh để hiển thị
            </div>
          )}
        </div>

        {/* Pagination Bottom */}
        <div className="flex justify-center gap-2 mx-5 my-2">
          {Array.from({ length: totalPages }, (_, index) => index + 1).map(
            (pageNumber) => (
              <button
                key={pageNumber}
                onClick={() => handlePageClick(pageNumber)}
                className={`px-3 py-1 rounded ${
                  page === pageNumber
                    ? "bg-[#eee] text-gray-600"
                    : "bg-gray-600 text-white"
                }`}
              >
                {pageNumber}
              </button>
            )
          )}
        </div>
      </div>
    </>
  );
};

export default MyPhotoP;

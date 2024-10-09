import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import PhotographerApi from "../../apis/PhotographerApi";
import LoadingSpinner from "../LoadingSpinner/LoadingSpinner";
import DetailedPhotoView from "../../pages/DetailPhoto/DetailPhoto";
import { useNavigate } from "react-router-dom";

const MyPhotoP = () => {
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(null);
  const [page, setPage] = useState(1);
  const itemsPerPage = 12;

  const { data, isFetching, isError, error } = useQuery({
    queryKey: ["my-photo", page],
    queryFn: () => PhotographerApi.getMyPhotos(itemsPerPage, page - 1),
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
        <div className="flex mx-2 gap-1 justify-center 2xl:justify-start flex-wrap hover:cursor-pointer">
          {isError && (
            <div className="text-red-500">{JSON.stringify(error)}</div>
          )}
          {isFetching ? (
            <div className="flex justify-center w-full">
              <LoadingSpinner />
            </div>
          ) : data?.objects.length > 0 ? (
            data.objects
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
              .map((photo) => (
                <div key={photo.id} className="relative group">
                  <div className="w-[380px] h-[320px] overflow-hidden">
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

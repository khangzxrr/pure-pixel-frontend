import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import PhotographerApi from "../../apis/PhotographerApi";
import LoadingSpinner from "../LoadingSpinner/LoadingSpinner";
import DetailedPhotoView from "../../pages/DetailPhoto/DetailPhoto";
import { useNavigate } from "react-router-dom";
import MyPhotoFilter from "./MyPhotoFilter";
import UseMyPhotoFilter from "../../states/UseMyPhotoFilter";
import { IoMdImages } from "react-icons/io";
import FilterModel from "./FilterModel";
import { FaFilter, FaFilterCircleXmark, FaHeart } from "react-icons/fa6";
import { FaSearch } from "react-icons/fa";
import { IoCloseCircleOutline } from "react-icons/io5";
import { MdDateRange } from "react-icons/md";
const MyPhotoP = () => {
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState(null);
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  const { inputValue, setInputValue, setSearchResult } = UseMyPhotoFilter();
  const filterByPhotoDate = UseMyPhotoFilter(
    (state) => state.filterByPhotoDate
  );
  const searchResult = UseMyPhotoFilter((state) => state.searchResult);
  const searchPhoto = searchResult;
  const orderByCreatedAt = filterByPhotoDate.param;
  const setFilterByPhotoDate = UseMyPhotoFilter(
    (state) => state.setFilterByPhotoDate
  );

  const setFilterByUpVote = UseMyPhotoFilter(
    (state) => state.setFilterByUpVote
  );
  const filterByUpVote = UseMyPhotoFilter((state) => state.filterByUpVote);
  const orderByUpVote = filterByUpVote.param;
  const {
    isWatermarkChecked,
    isForSaleChecked,
    setIsForSaleChecked,
    setIsWatermarkChecked,
  } = UseMyPhotoFilter();
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
  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };
  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };
  const handleSearch = () => {
    setSearchResult(inputValue);
  };
  const handleResetFilter = () => {
    setFilterByPhotoDate("", "");
    setFilterByUpVote("", "");
    setIsWatermarkChecked(false);
    setIsForSaleChecked(false);
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
      {selectedFilter && (
        <FilterModel onClose={() => setSelectedFilter(null)} />
      )}

      <div className="flex items-center justify-between my-[5px]">
        <div className="flex flex-col md:flex-row items-start gap-2 md:items-center">
          <button
            className="flex items-center gap-1 px-3 py-1 rounded-r-md bg-[#2f3136] text-white"
            onClick={() => setSelectedFilter(true)}
          >
            Bộ lọc ảnh <FaFilter />
          </button>
          {isForSaleChecked ? (
            <div className="flex items-center gap-1 py-1 px-3 font-normal rounded-md border ">
              Ảnh đang bán{" "}
              <IoCloseCircleOutline
                className="text-xl hover:cursor-pointer hover:text-red-500"
                onClick={() => setIsForSaleChecked(false)}
              />
            </div>
          ) : (
            ""
          )}
          {isWatermarkChecked ? (
            <div className="flex items-center gap-1 py-1 px-3 font-normal rounded-md border ">
              Ảnh watermark{" "}
              <IoCloseCircleOutline
                className="text-xl hover:cursor-pointer hover:text-red-500"
                onClick={() => setIsWatermarkChecked(false)}
              />
            </div>
          ) : (
            ""
          )}
          {filterByPhotoDate.param !== "" ? (
            <div className="flex items-center gap-1 py-1 px-3 font-normal rounded-md border">
              <MdDateRange /> {filterByPhotoDate.name}
              <IoCloseCircleOutline
                className="text-xl hover:cursor-pointer hover:text-red-500"
                onClick={() => {
                  setFilterByPhotoDate("", "");
                }}
              />
            </div>
          ) : (
            ""
          )}
          {filterByUpVote.param !== "" ? (
            <div className="flex items-center gap-1 py-1 px-3 font-normal rounded-md border">
              <FaHeart /> {filterByUpVote.name}
              <IoCloseCircleOutline
                className="text-xl hover:cursor-pointer hover:text-red-500"
                onClick={() => {
                  setFilterByUpVote("", "");
                }}
              />
            </div>
          ) : (
            ""
          )}
          {isForSaleChecked ||
          isWatermarkChecked ||
          filterByPhotoDate.param !== "" ||
          filterByUpVote.param !== "" ? (
            <div
              className="hover:cursor-pointer flex items-center gap-2 font-normal px-3 py-1 rounded-md border border-red-500 text-red-500"
              onClick={handleResetFilter}
            >
              Xóa bộ lọc <FaFilterCircleXmark />
            </div>
          ) : (
            ""
          )}
        </div>

        <div>
          <div className="flex items-center bg-[#202225] rounded-lg">
            <input
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              type="text"
              placeholder={`Tìm kiếm ảnh theo tên ảnh...`}
              className="font-normal text-sm px-2 py-2 w-[150px] md:w-[270px] pl-4 bg-[#202225] rounded-lg text-white focus:outline-none"
            />
            <div className="flex items-center px-3">
              <button className="" onClick={handleSearch}>
                <FaSearch />
              </button>
            </div>
          </div>
        </div>
        {/* <MyPhotoFilter /> */}
      </div>
      <div className="flex flex-col h-full py-2 bg-[#2f3136]">
        {/* Pagination Top */}
        {data?.objects.length > 0 ? (
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
        ) : (
          ""
        )}

        {/* Photos Display */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 mx-2">
          {isError && (
            <div className="text-red-500">{JSON.stringify(error)}</div>
          )}
          {isFetching ? (
            <div className="flex justify-center w-full">
              <LoadingSpinner />
            </div>
          ) : data?.objects.length > 0 ? (
            data.objects.map((photo) => (
              <div
                key={photo.id}
                className="relative group hover:cursor-pointer"
              >
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
                    {photo.title?.length > 20
                      ? `${photo.title.substring(0, 15)}...`
                      : photo.title || "Không xác định"}
                    <div>{photo.category?.name || "Không xác định"}</div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="flex justify-center items-center w-full col-span-5 h-[60vh] ">
              <div className="flex flex-col items-center text-[#8b8d91]">
                <IoMdImages className="text-[100px] " />
                <p className="select-none">Không tìm thấy ảnh khả dụng!</p>
              </div>
            </div>
          )}
        </div>

        {/* Pagination Bottom */}
        {data?.objects.length > 0 ? (
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
        ) : (
          ""
        )}
      </div>
    </>
  );
};

export default MyPhotoP;

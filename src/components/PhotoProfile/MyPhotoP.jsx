import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import PhotographerApi from "../../apis/PhotographerApi";
import LoadingSpinner from "../LoadingSpinner/LoadingSpinner";
import DetailedPhotoView from "../../pages/DetailPhoto/DetailPhoto";
import { useNavigate } from "react-router-dom";
import MyPhotoFilter from "./MyPhotoFilter";
import UseMyPhotoFilter from "../../states/UseMyPhotoFilter";
import { IoMdImages } from "react-icons/io";
import { BiDotsVerticalRounded } from "react-icons/bi";

import FilterModel from "./FilterModel";
import { FaFilter, FaFilterCircleXmark, FaHeart } from "react-icons/fa6";
import { FaSearch } from "react-icons/fa";
import { IoCloseCircleOutline } from "react-icons/io5";
import { MdDateRange } from "react-icons/md";
import { ConfigProvider, Pagination, Tooltip } from "antd";
import { motion } from "framer-motion";
import UpdateDropdown from "./UpdateDropdown";
import { thumbnail } from "exifr";

const MyPhotoP = ({ page, setPage, itemsPerPage }) => {
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState(null);
  const { inputValue, setInputValue, setSearchResult } = UseMyPhotoFilter();
  const filterByPhotoDate = UseMyPhotoFilter(
    (state) => state.filterByPhotoDate
  );
  const searchResult = UseMyPhotoFilter((state) => state.searchResult);
  const orderByCreatedAt = UseMyPhotoFilter(
    (state) => state.filterByPhotoDate.param
  );
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
  const selling = false;

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
        searchResult,
        "RAW"
      ),
    keepPreviousData: true,
  });

  const handleOnClick = (photo) => {
    setSelectedImage(photo);
  };

  const totalPages = data?.totalPage || 1;

  const handlePageClick = (pageNumber) => {
    if (pageNumber !== page) {
      setPage(pageNumber);
    }
  };

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
    setPage(1);
  };

  const handleResetFilter = () => {
    setFilterByPhotoDate("Mới nhất", "desc");
    setFilterByUpVote("", "");
    setIsWatermarkChecked(false);
    setIsForSaleChecked(false);
  };

  // Parallax Effect State
  const [scrollY, setScrollY] = useState(0);
  const defaultHeight = 200;
  const containerHeight = scrollY < 200 ? defaultHeight - scrollY * 0.5 : 0;

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
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
      {/* <motion.div
          style={{ overflow: "hidden" }}
          animate={{ height: containerHeight }}
          transition={{ duration: 0.01, ease: "easeInOut" }}
          className="w-full bg-[#1e1e1e] p-4"
        > */}
      {selectedImage && (
        <DetailedPhotoView
          photo={selectedImage}
          idImg={selectedImage?.id}
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

      {/* Parallax Container */}
      <div className="flex items-center justify-between">
        {/* Filter Buttons */}
        <div className="flex flex-col md:flex-row items-start gap-2 md:items-center">
          <button
            className="flex items-center gap-1 px-3 py-1 rounded-r-md bg-[#2f3136] text-white"
            onClick={() => setSelectedFilter(true)}
          >
            Bộ lọc ảnh <FaFilter />
          </button>
          {isForSaleChecked && (
            <div className="flex items-center gap-1 py-1 px-3 font-normal rounded-md border">
              Ảnh đang bán{" "}
              <IoCloseCircleOutline
                className="text-xl hover:cursor-pointer hover:text-red-500"
                onClick={() => setIsForSaleChecked(false)}
              />
            </div>
          )}
          {isWatermarkChecked && (
            <div className="flex items-center gap-1 py-1 px-3 font-normal rounded-md border">
              Ảnh watermark{" "}
              <IoCloseCircleOutline
                className="text-xl hover:cursor-pointer hover:text-red-500"
                onClick={() => setIsWatermarkChecked(false)}
              />
            </div>
          )}
          {filterByPhotoDate.param && (
            <div className="flex items-center gap-1 py-1 px-3 font-normal rounded-md border">
              <MdDateRange /> {filterByPhotoDate.name}
              {/* <IoCloseCircleOutline
                className="text-xl hover:cursor-pointer hover:text-red-500"
                onClick={() => setFilterByPhotoDate("", "")}
              /> */}
            </div>
          )}
          {filterByUpVote.param && (
            <div className="flex items-center gap-1 py-1 px-3 font-normal rounded-md border">
              <FaHeart /> {filterByUpVote.name}
              <IoCloseCircleOutline
                className="text-xl hover:cursor-pointer hover:text-red-500"
                onClick={() => setFilterByUpVote("", "")}
              />
            </div>
          )}
          {(isForSaleChecked ||
            isWatermarkChecked ||
            // filterByPhotoDate.param ||
            filterByUpVote.param) && (
            <div
              className="hover:cursor-pointer flex items-center gap-2 font-normal px-3 py-1 rounded-md border border-red-500 text-red-500"
              onClick={handleResetFilter}
            >
              Xóa bộ lọc <FaFilterCircleXmark />
            </div>
          )}
        </div>

        {/* Search Input */}
        <div>
          <div className="flex items-center bg-[#202225] rounded-lg">
            <input
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              type="text"
              placeholder="Tìm kiếm ảnh theo tên ảnh..."
              className="font-normal text-sm px-2 py-2 w-[150px] md:w-[270px] pl-4 bg-[#202225] rounded-lg text-white focus:outline-none"
            />
            <div className="flex items-center px-3">
              <button onClick={handleSearch}>
                <FaSearch />
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* </motion.div> */}

      {/* Pagination Top */}
      <div className="flex flex-col h-full py-2 ">
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

        {/* Photo Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3  gap-2 mx-2">
          {isError ? (
            <div className="text-red-500">{JSON.stringify(error)}</div>
          ) : isFetching ? (
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
                    onClick={() => handleOnClick(photo)}
                  />
                </div>
                <UpdateDropdown
                  photo={{
                    id: photo.id,
                    watermark: photo.watermark,
                    title: photo.title,
                    description: photo.description,
                    visibility: photo.visibility,
                    categories: photo.categories,
                    photoTags: photo.photoTags,
                    exif: photo.exif,
                    gps: {
                      longitute: photo.exif.longitude,
                      latitude: photo.exif.latitude,
                    },
                    originalPhotoUrl: photo.signedUrl.url,
                    thumbnailPhotoUrl: photo.signedUrl.thumbnail,
                  }}
                  totalRecord={data?.totalRecord}
                  page={page}
                  setPage={setPage}
                />
                <div className="absolute bottom-0 left-0 w-full bg-black bg-opacity-50 text-white text-center py-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-md">
                  <div className="flex justify-between px-1">
                    {photo.title?.length > 20
                      ? `${photo.title.substring(0, 10)}...`
                      : photo.title || "Không xác định"}
                    <div>
                      {photo.visibility === "PUBLIC" ? "Công khai" : "Riêng tư"}{" "}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="flex justify-center items-center w-full col-span-5 h-[60vh]">
              <div className="flex flex-col items-center text-[#8b8d91]">
                <IoMdImages className="text-[100px]" />
                <p className="select-none">Không tìm thấy ảnh khả dụng!</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </ConfigProvider>
  );
};

export default MyPhotoP;

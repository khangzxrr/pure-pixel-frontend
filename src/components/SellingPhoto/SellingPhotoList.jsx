import { useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import PhotoApi from "../../apis/PhotoApi";
import LoadingSpinner from "../LoadingSpinner/LoadingSpinner";
import { IoMdImages } from "react-icons/io";
import { FaArrowRightLong } from "react-icons/fa6";
import UseUserOtherStore from "../../states/UseUserOtherStore";
import { ConfigProvider, Pagination } from "antd";
import UseSellingPhotoStore from "../../states/UseSellingPhotoStore";

const SellingPhotoList = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const itemsPerPage = 9; // Tổng số ảnh
  // const [page, setPage] = useState(1);

  const { page, setPage } = UseSellingPhotoStore();

  const [selectedImage, setSelectedImage] = useState(null);
  const setNameUserOther = UseUserOtherStore((state) => state.setNameUserOther);
  const setUserOtherId = UseUserOtherStore((state) => state.setUserOtherId);
  const selling = true;
  const searchResult = UseSellingPhotoStore((state) => state.searchResult);
  const searchByPhotoTitle = UseSellingPhotoStore(
    (state) => state.searchByPhotoTitle
  );
  const { data, isLoading, isError, error, isFetching } = useQuery({
    queryKey: ["public-photos-selling", page, searchResult, searchByPhotoTitle],
    queryFn: () =>
      PhotoApi.getPublicPhotos(
        itemsPerPage,
        page - 1,
        null,
        "desc",
        null,
        null,
        selling,
        searchResult,
        searchByPhotoTitle,
        null,
        null
      ),
    keepPreviousData: true,
  });
  const totalPages = data?.totalPage || 1;

  const handlePageClick = (pageNumber) => {
    if (pageNumber !== page) {
      setPage(pageNumber);
    }
  };
  const formatPrice = (price) => {
    return price > 0
      ? price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "đ"
      : "Chưa có giá";
  };
  const handleOnClick = (id) => {
    queryClient.invalidateQueries({ queryKey: ["get-photo-by-id"] });
    setSelectedImage(id);
  };

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
      <div className="h-screen">
        <div className="flex flex-col py-2">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-4 pb-4">
            {isFetching && (
              <div className="flex justify-center items-center col-span-3 h-[200px]">
                <LoadingSpinner />
              </div>
            )}
            {data?.objects.length > 0 ? (
              data.objects.map((photo) => {
                const prices =
                  photo.photoSellings?.flatMap(
                    (selling) =>
                      selling.pricetags?.map((pricetag) => pricetag.price) || []
                  ) || [];

                const highestPrice =
                  prices.length > 0 ? Math.max(...prices) : 0;
                const lowestPrice = prices.length > 0 ? Math.min(...prices) : 0;

                return (
                  <div
                    key={photo.id}
                    className="relative group hover:cursor-pointer "
                  >
                    <div
                      onClick={() =>
                        navigate(`/explore/product-photo/${photo.id}`)
                      }
                      className="h-[320px] overflow-hidden rounded-lg"
                    >
                      <img
                        className="w-full h-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-110"
                        src={photo.signedUrl.thumbnail} // Cần thêm URL của ảnh
                        alt={photo.title || "Ảnh"}
                      />
                    </div>
                    <div className="absolute bottom-0 left-0 w-full rounded-b-lg bg-black bg-opacity-50 text-white text-center py-2 transition-opacity duration-300 backdrop-blur-md">
                      <div className="flex justify-between px-1 ">
                        <div className="flex items-center gap-2">
                          <div className="truncate lg:max-w-[300px] max-w-[200px]">
                            {photo.title || "Không xác định"}
                          </div>
                        </div>

                        <div className="">
                          {lowestPrice === highestPrice ? (
                            <span>{formatPrice(highestPrice)}</span>
                          ) : (
                            <span className="flex gap-2 items-center">
                              {formatPrice(lowestPrice)} <FaArrowRightLong />{" "}
                              {formatPrice(highestPrice)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="absolute flex items-center gap-2 p-2 top-0 left-0 w-full bg-black backdrop-blur bg-opacity-60 text-white rounded-t-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="size-7 overflow-hidden rounded-full">
                        <img
                          src={photo.photographer.avatar}
                          alt=""
                          className="size-full object-cover bg-[#eee]"
                        />
                      </div>
                      <div
                        onClick={() => {
                          navigate(`/user/${photo.photographer.id}`);
                          setNameUserOther(photo.photographer.name);
                          setUserOtherId(photo.photographer.id);
                        }}
                        className=" truncate max-w-[200px] hover:underline underline-offset-2 hover:cursor-pointer"
                      >
                        {photo.photographer.name}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex justify-center items-center w-full col-span-5 h-[200px]">
                <div className="flex flex-col items-center text-[#8b8d91]">
                  <IoMdImages className="text-[100px]" />
                  <p className="select-none">Không tìm thấy ảnh khả dụng!</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ConfigProvider>
  );
};

export default SellingPhotoList;

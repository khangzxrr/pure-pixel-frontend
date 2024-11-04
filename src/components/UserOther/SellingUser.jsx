import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import UseUserOtherStore from "../../states/UseUserOtherStore";
import { useQuery } from "@tanstack/react-query";
import PhotographerApi from "../../apis/PhotographerApi";
import LoadingSpinner from "../LoadingSpinner/LoadingSpinner";
import { IoMdImages } from "react-icons/io";
import PhotoApi from "../../apis/PhotoApi";
import { FaArrowRightLong } from "react-icons/fa6";

const SellingUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const itemsPerPage = 9;

  const selling = true;
  const { data, isFetching, isError, error } = useQuery({
    queryKey: ["selling-user", page, id],
    queryFn: () =>
      PhotoApi.getPublicPhotos(
        itemsPerPage,
        page - 1,
        null,
        null,
        null,
        null,
        selling,
        null,
        null,
        id,
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

  // Hàm định dạng giá với dấu chấm
  const formatPrice = (price) => {
    return price > 0
      ? price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "đ"
      : "Chưa có giá";
  };

  return (
    <div className="flex flex-col p-2 pb-6">
      {/* phân trang top  */}
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
      {/* hiển thị hình ảnh  */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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

            const highestPrice = prices.length > 0 ? Math.max(...prices) : 0;
            const lowestPrice = prices.length > 0 ? Math.min(...prices) : 0;

            return (
              <div
                key={photo.id}
                className="relative group hover:cursor-pointer "
              >
                <div className="h-[320px] overflow-hidden rounded-lg">
                  <img
                    className="w-full h-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-110"
                    src={photo.signedUrl.thumbnail} // Cần thêm URL của ảnh
                    alt={photo.title || "Ảnh"}
                  />
                </div>
                <div className="absolute bottom-0 left-0 w-full rounded-b-lg bg-black bg-opacity-50 text-white text-center py-2 transition-opacity duration-300 backdrop-blur-md">
                  <div className="flex justify-between px-1">
                    {photo.title || "Không xác định"}
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
  );
};

export default SellingUser;

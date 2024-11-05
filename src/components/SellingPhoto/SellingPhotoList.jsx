import { useKeycloak } from "@react-keycloak/web";
import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import UseSellingPhotoStore from "../../states/UseSellingPhotoStore";
import PhotoApi from "../../apis/PhotoApi";
import Masonry from "react-masonry-css";
import LoadingSpinner from "../LoadingSpinner/LoadingSpinner";
import InfiniteScroll from "react-infinite-scroll-component";
import DetailedPhotoView from "../../pages/DetailPhoto/DetailPhoto";
import { FaRegHeart } from "react-icons/fa";
import { FiShare2 } from "react-icons/fi";
import { IoMdImages } from "react-icons/io";
import BlurhashImage from "../BlurhashImage/BlurhashImage";
import { FaArrowRightLong } from "react-icons/fa6";

const SellingPhotoList = () => {
  const { keycloak } = useKeycloak();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const itemsPerPage = 9; // Tổng số ảnh
  const [page, setPage] = useState(1);
  const [selectedImage, setSelectedImage] = useState(null);

  const selling = true;

  const { data, isLoading, isError, error, isFetching } = useQuery({
    queryKey: ["public-photos-selling", page],
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
    <div className="h-screen">
      <div>
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

              const highestPrice = prices.length > 0 ? Math.max(...prices) : 0;
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
    </div>
  );
};

export default SellingPhotoList;

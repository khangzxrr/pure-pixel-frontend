import React, { useEffect, useState } from "react";
import { getData } from "./../../apis/api";
import {
  ShoppingBag,
  Share2,
  MessageCircle,
  User,
  MoreHorizontal,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import PhotographerApi from "../../apis/PhotographerApi";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ConfigProvider, Pagination } from "antd";
import UserProfileApi from "../../apis/UserProfile";
import { FaSearch } from "react-icons/fa";
import DropdownSeller from "./DropdownSeller";
import { FaImages } from "react-icons/fa6";
function formatCurrency(number) {
  // Sử dụng hàm toLocaleString() để định dạng số thành chuỗi với ngăn cách hàng nghìn và mặc định là USD.
  if (typeof number === "number") {
    return number.toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
    });
  }
}
const SellerProfile = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  const selling = true;
  const orderByCreatedAt = "desc";
  const [inputValue, setInputValue] = useState("");
  const [photoTitle, setPhotoTitle] = useState("");
  const { data, isLoading, isError } = useQuery({
    queryKey: ["my-photo-selling", page, selling, orderByCreatedAt, photoTitle],
    queryFn: () =>
      PhotographerApi.getMyPhotos(
        itemsPerPage,
        page - 1,
        orderByCreatedAt,
        null,
        null,
        selling,
        photoTitle.trim() || null
      ),
    keepPreviousData: true,
  });

  const queryClient = useQueryClient();
  const callData = () => {
    console.log(12321321);

    queryClient.invalidateQueries({
      queryKey: ["my-photo-selling"],
    });
  };

  const {
    data: myProfile,
    isLoading: isLoadingMyProfile,
    isError: isErrorMyProfile,
  } = useQuery({
    queryKey: ["my-profile"],
    queryFn: () => UserProfileApi.getMyProfile(),
  });

  const myPhotosSelling = data?.objects || [];
  const totalPages = data?.totalPage || 1;

  const handlePageClick = (pageNumber) => {
    if (pageNumber !== page) {
      setPage(pageNumber);
    }
  };
  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleSearch = () => {
    setPhotoTitle(inputValue);
    setPage(1);
  };
  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleSearch();
    }
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
      <div className="min-h-screen">
        {/* Seller Profile Header */}
        {isLoadingMyProfile && <div>Loading...</div>}
        <div className="relative">
          <img
            src={myProfile?.cover}
            alt="Eagle"
            className="w-full h-[500px] object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center space-x-4 ml-6">
                <ShoppingBag className="w-6 h-6" />
                <h1 className="text-2xl font-bold">Cửa hàng</h1>
              </div>
            </div>
            <div className=" flex items-end justify-between shadow-md p-4">
              <div className="flex items-center space-x-4">
                <img
                  src={myProfile?.avatar}
                  alt="Dr.Bedirhan Küpeli"
                  className="w-16 h-16 rounded-full bg-[#eee]"
                />
                <div>
                  <h2 className="text-xl font-semibold">{myProfile?.name}</h2>
                  <p className="text-gray-400">{myProfile?.mail}</p>
                </div>
              </div>
              {/* <div className="flex space-x-4">
              <Share2 className="w-6 h-6" />
              <MessageCircle className="w-6 h-6" />
              <User className="w-6 h-6" />
              <MoreHorizontal className="w-6 h-6" />
            </div> */}
            </div>
          </div>
        </div>
        <div className="flex justify-end items-center mt-2 mx-2 font-normal text-[#eee]">
          <div className="flex items-center gap-2 bg-[#202225] w-[300px] rounded-md py-1 px-2">
            <input
              type="text"
              placeholder="Tìm kiếm theo tên ảnh..."
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              className="px-1 outline-none bg-[#202225] w-[300px] rounded-md"
            />
            <div onClick={handleSearch} className="hover:cursor-pointer">
              <FaSearch />
            </div>
          </div>
        </div>
        {/* Products Grid */}
        <div className="container mx-auto p-4">
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
          {myPhotosSelling.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoading && <div>Loading...</div>}
              {isError && <div>Error</div>}
              {myPhotosSelling.map((product) => (
                <div
                  key={product.id}
                  className="relative group hover:cursor-pointer"
                >
                  <div
                    onClick={() => {
                      navigate(`/profile/product-photo/${product.id}`);
                    }}
                    className="rounded-lg shadow-md overflow-hidden transition-transform transform hover:scale-100 hover:shadow-lg cursor-pointer"
                  >
                    <img
                      src={product.signedUrl.thumbnail}
                      alt={product?.photoSellings[0]?.description}
                      className="w-full h-[300px] object-cover pointer-events-none"
                      draggable="false" // Ngăn người dùng kéo ảnh
                    />
                    <div className="p-4">
                      <div className="flex justify-between">
                        <h3 className="text-lg font-semibold mb-2">
                          {product.title}
                        </h3>
                      </div>
                      <p className="text-gray-300">
                        Giá:{" "}
                        {formatCurrency(
                          product?.photoSellings[0]?.pricetags[0]?.price
                        )}
                      </p>
                    </div>
                  </div>
                  <div className=" ">
                    <DropdownSeller photo={product} callData={callData} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col justify-center items-center h-[200px]">
              <FaImages className="text-[100px] text-gray-400" />
              <p className="text-center text-lg text-gray-400">
                Không tìm thấy ảnh trong cửa hàng. Hãy{" "}
                <span
                  onClick={() => navigate("/upload/sell")}
                  className="font-bold text-blue-500 uppercase cursor-pointer hover:underline underline-offset-2"
                >
                  tải lên
                </span>{" "}
                những bức ảnh nghệ thuật độc đáo của bạn để bắt đầu kinh doanh!
              </p>
            </div>
          )}
        </div>
      </div>
    </ConfigProvider>
  );
};

export default SellerProfile;

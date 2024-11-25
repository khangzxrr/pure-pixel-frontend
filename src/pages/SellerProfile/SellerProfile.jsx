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
  const { id } = useParams();
  const [dataUser, setDataUser] = useState({});
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      getData(`/photographer/${id}/profile`)
        .then((data) => {
          setDataUser(data?.data?.photographer);
        })
        .catch((error) => {
          console.log(error);
        });
      getData(`photo/public?limit=10&page=0&photographerId=${id}&selling=true`)
        .then((data) => {
          setProducts(data?.data?.objects);
          console.log(1234, data);
        })
        .catch((error) => {
          console.log(error);
        });
    } else {
      getData(`/me`)
        .then((data) => {
          setDataUser(data?.data);
          console.log(666, data);
        })
        .catch((error) => {
          console.log(error);
        });
      getData(
        `photographer/me/photo?limit=10&page=0&selling=true&orderByUpdatedAt=desc`
      )
        .then((data) => {
          setProducts(data?.data?.objects);
          console.log(123, data);
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }, [id]);
  return (
    <div className=" min-h-screen">
      {/* Seller Profile Header */}
      <div className="relative">
        <img
          src={dataUser?.cover}
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
                src={dataUser?.avatar}
                alt="Dr.Bedirhan Küpeli"
                className="w-16 h-16 rounded-full"
              />
              <div>
                <h2 className="text-xl font-semibold">{dataUser?.name}</h2>
                <p className="text-gray-400">{dataUser?.mail}</p>
              </div>
            </div>
            <div className="flex space-x-4">
              <Share2 className="w-6 h-6" />
              <MessageCircle className="w-6 h-6" />
              <User className="w-6 h-6" />
              <MoreHorizontal className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              onClick={() => {
                navigate(`/profile/product-photo/${product.id}`);
              }}
              className="rounded-lg shadow-md overflow-hidden transition-transform transform hover:scale-105 hover:shadow-lg cursor-pointer"
            >
              <img
                src={product.signedUrl.thumbnail}
                alt={product?.photoSellings[0]?.description}
                className="w-full h-[300px] object-cover pointer-events-none"
                draggable="false" // Ngăn người dùng kéo ảnh
              />
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2">
                  {product.title}
                  {/* {product.photoSellings[0].description} */}
                </h3>
                <p className="text-gray-300">
                  Giá:{" "}
                  {formatCurrency(
                    product?.photoSellings[0]?.pricetags[0]?.price
                  )}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SellerProfile;

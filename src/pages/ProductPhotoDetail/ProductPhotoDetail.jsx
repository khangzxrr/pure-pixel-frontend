import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getData, postData } from "../../apis/api";
import { message } from "antd";
import UserService from "../../services/Keycloak";
import { useKeycloak } from "@react-keycloak/web";

const ProductPhotoDetail = () => {
  const [data, setData] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const { id } = useParams();
  const { keycloak } = useKeycloak();
  const handleLogin = () => keycloak.login();
  const userData = UserService.getTokenParsed();
  console.log(userData.sub);
  console.log(data);
  
  useEffect(() => {
    // Gọi API để lấy dữ liệu
    getData(`photo/${id}`)
      .then((response) => {
        setData(response.data);
        console.log(response.data);

        // Đặt kích thước mặc định là kích thước đầu tiên
        if (
          response.data.photoSellings &&
          response.data.photoSellings[0] &&
          response.data.photoSellings[0].pricetags &&
          response.data.photoSellings[0].pricetags[0]
        ) {
          setSelectedSize(response.data.photoSellings[0].pricetags[0].size);
        }
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, [id]);

  if (!data) {
    return <div className="min-h-screen text-white p-8">Loading...</div>;
  }

  const photoSelling =
    data.photoSellings && data.photoSellings.length > 0
      ? data.photoSellings[0]
      : null;

  const sizes =
    photoSelling && photoSelling.pricetags
      ? photoSelling.pricetags.map((pricetag) => pricetag.size)
      : [];

  const selectedPricetag =
    photoSelling && photoSelling.pricetags
      ? photoSelling.pricetags.find(
          (pricetag) => pricetag.size === selectedSize
        )
      : null;

  const price = selectedPricetag ? selectedPricetag.price : 0;

  const handleBuyNow = () => {
    if (data && photoSelling && selectedPricetag) {
      const { id: photoId } = data;
      const { id: photoSellId } = photoSelling;
      const { id: pricetagId } = selectedPricetag;

      // Gọi API khi người dùng nhấn "Mua ngay"
      postData(
        `/photo/${photoId}/photo-sell/${photoSellId}/price-tag/${pricetagId}`
      )
        .then((response) => {
          console.log("Mua ngay thành công:", response);
          message.success("Mua thành công vui");

          // Thực hiện các hành động tiếp theo, ví dụ: chuyển hướng đến trang thanh toán
        })
        .catch((error) => {
          console.error("Lỗi khi mua ngay:", error);
          switch (error.data.message) {
            case "ExistPhotoBuyWithChoosedResolutionException":
              message.error("Bạn đã mua hình ảnh này rồi");

              break;
            case "CannotBuyOwnedPhotoException":
              message.error("Bạn không thể mua ảnh của chính mình");

              break;

            default:
              break;
          }
          // Hiển thị thông báo lỗi cho người dùng
        });
    } else {
      console.error("Thiếu thông tin để mua hàng.");
      // Hiển thị thông báo lỗi cho người dùng
    }
  };

  return (
    <div className="min-h-screen text-white p-8">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">
        <div className="lg:w-2/3">
          <div className="bg-gray-800 p-4 rounded-lg">
            <img
              src={data.signedUrl.url}
              alt={data.title}
              className="w-full h-auto rounded-lg"
            />
          </div>
        </div>
        <div className="lg:w-1/3">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              {photoSelling.description}
            </h1>
          </div>

          <p className="text-3xl font-bold mb-2">{price.toLocaleString()}Đ</p>

          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Kích thước</h2>
            <div className="flex flex-wrap gap-4">
              {sizes.map((size) => (
                <button
                  key={size}
                  className={`px-4 py-2 rounded-full ${
                    selectedSize === size
                      ? "bg-white text-gray-900"
                      : "bg-gray-700 text-white"
                  }`}
                  onClick={() => setSelectedSize(size)}
                >
                  {size}px
                </button>
              ))}
            </div>
          </div>
          {userData ? (
            <>
              {userData.sub === data}
              <button
                className="w-full bg-white text-gray-900 py-3 rounded-lg hover:bg-gray-200 transition-colors"
                onClick={handleBuyNow}
              >
                Mua ngay
              </button>
            </>
          ) : (
            <button
              className="w-full bg-white text-gray-900 py-3 rounded-lg hover:bg-gray-200 transition-colors"
              onClick={handleLogin}
            >
              Đăng nhập để mua ngay
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductPhotoDetail;

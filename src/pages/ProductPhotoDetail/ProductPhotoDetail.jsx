import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getData, postData } from "../../apis/api";
import { message } from "antd";
import UserService from "../../services/Keycloak";
import { useKeycloak } from "@react-keycloak/web";
import { useModalState } from "./../../hooks/useModalState";
import { ChevronLeft } from "lucide-react";
import ComPriceConverter from "./../../components/ComPriceConverter/ComPriceConverter";
import CommentPhoto from "../../components/CommentPhoto/CommentPhoto";

const ProductPhotoDetail = () => {
  const [data, setData] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("SEPAY");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [transactionId, setTransactionId] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const modal = useModalState();
  const { id } = useParams();
  const { keycloak } = useKeycloak();
  const handleLogin = () => keycloak.login();
  const userData = UserService.getTokenParsed();
  const navigate = useNavigate();
  const reload = () => {
    getData(`photo/${id}`)
      .then((response) => {
        setData(response.data);

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
  };
  useEffect(() => {
    reload();
  }, [id]);

  useEffect(() => {
    let intervalId;

    if (transactionId && paymentStatus === "PENDING") {
      // Start polling every 5 seconds
      intervalId = setInterval(() => {
        getData(`payment/transaction/${transactionId}`)
          .then((response) => {
            const status = response.data.status; // Adjust based on actual API response
            console.log(response);

            if (status === "SUCCESS") {
              setPaymentStatus("SUCCESS");
              message.success("Thanh toán thành công!");
              clearInterval(intervalId);
              setTimeout(() => {
                modal?.handleClose();
                navigate(`/profile/photos-bought`);
              }, 1000);
            } else if (status === "FAILED") {
              setPaymentStatus("FAILED");
              message.error("Thanh toán thất bại.");
              clearInterval(intervalId);
            }
          })
          .catch((error) => {
            console.error("Error checking payment status:", error);
          });
      }, 3000); // Poll every 5 seconds
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [transactionId, paymentStatus]);

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

  const handleConfirmPayment = () => {
    handleBuyNow(selectedPaymentMethod);
  };

  const handleBuyNow = (paymentMethod) => {
    if (data && photoSelling && selectedPricetag) {
      const { id: photoId } = data;
      const { id: photoSellId } = photoSelling;
      const { id: pricetagId } = selectedPricetag;

      postData(
        `/photo/${photoId}/photo-sell/${photoSellId}/price-tag/${pricetagId}/buy`,
        {
          paymentMethod: paymentMethod,
        }
      )
        .then((response) => {
          console.log("Mua ngay thành công:", response);

          if (paymentMethod === "SEPAY") {
            setTransactionId(
              response?.userToUserTransaction?.fromUserTransaction?.id
            ); // Adjust based on actual API response
            setQrCodeUrl(response.mockQrCode);
            setPaymentStatus("PENDING");
          } else if (paymentMethod === "WALLET") {
            modal?.handleClose();
            message.success("Thanh toán bằng ví thành công!");
          }
        })
        .catch((error) => {
          console.error("Lỗi khi mua ngay:", error);
          switch (error?.data?.message) {
            case "ExistSuccessedPhotoBuyException":
              message.error("Bạn đã mua hình ảnh này rồi");
              break;
            case "CannotBuyOwnedPhotoException":
              message.error("Bạn không thể mua ảnh của chính mình");
              break;
            default:
              message.error("Đã có lỗi vui lòng thử lại");
              break;
          }
        });
    } else {
      console.error("Thiếu thông tin để mua hàng.");
    }
  };

  const handleSizeChange = (size) => {
    setSelectedSize(size);
    setQrCodeUrl("");
    setTransactionId(null);
    setPaymentStatus(null);
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
            <h1 className="text-2xl font-bold mb-2">{data.title}</h1>
            <h1 className="text-xl font-bold mb-2 mt-4">Chi tiết:</h1>
            <h1 className="text-lg font-bold mb-2">
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
                  onClick={() => handleSizeChange(size)}
                >
                  {size}px
                </button>
              ))}
            </div>
          </div>
          {userData ? (
            <>
              <button
                className="w-full bg-white text-gray-900 py-3 rounded-lg hover:bg-gray-200 transition-colors"
                onClick={() => {
                  modal?.handleOpen();
                }}
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

          {modal?.isModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
              <div className="bg-gray-800 text-white rounded-lg w-full max-w-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-700">
                  <button
                    onClick={modal?.handleClose}
                    className="text-gray-400 hover:text-white"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <h2 className="text-xl font-semibold">Hóa đơn</h2>
                  <div className="w-6"></div>
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col md:flex-row gap-6">
                  {/* Payment Method Selection */}
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-4">
                      Chọn phương thức thanh toán:
                    </h3>
                    <div className="space-y-4">
                      <button
                        className={`w-full py-3 rounded-lg ${
                          selectedPaymentMethod === "SEPAY"
                            ? "bg-white text-gray-900"
                            : "bg-gray-700 text-white"
                        }`}
                        onClick={() => setSelectedPaymentMethod("SEPAY")}
                      >
                        Thanh toán bằng mã QR (SEPAY)
                      </button>
                      <button
                        className={`w-full py-3 rounded-lg ${
                          selectedPaymentMethod === "WALLET"
                            ? "bg-white text-gray-900"
                            : "bg-gray-700 text-white"
                        }`}
                        onClick={() => setSelectedPaymentMethod("WALLET")}
                      >
                        Thanh toán bằng ví
                      </button>
                    </div>

                    {/* QR Code Display */}
                    {selectedPaymentMethod === "SEPAY" && qrCodeUrl && (
                      <div className="p-6 flex flex-col items-center">
                        <img
                          src={qrCodeUrl}
                          alt="QR Code"
                          className="w-48 h-48"
                        />
                        {paymentStatus === "PENDING" && (
                          <div className="text-center text-yellow-500 mt-4">
                            Đang chờ thanh toán...
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Order Summary */}
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-4">
                      Tóm tắt đơn hàng
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold">
                            {photoSelling.description}
                          </h4>
                          <p className="text-sm text-gray-400">
                            {selectedSize}px
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="font-semibold">
                            <ComPriceConverter>{price}</ComPriceConverter>
                          </span>
                        </div>
                      </div>

                      <div className="border-t border-gray-700 pt-4">
                        <div className="flex justify-between items-center mb-4">
                          <span className="font-semibold">
                            Tổng tiền phải trả
                          </span>
                          <span className="font-semibold text-xl">
                            <ComPriceConverter>{price}</ComPriceConverter>
                          </span>
                        </div>
                        {selectedPaymentMethod === "WALLET" && (
                          <button
                            className="w-full bg-white text-gray-900 rounded-lg py-3 font-semibold hover:bg-gray-200 transition-colors"
                            onClick={handleConfirmPayment}
                          >
                            Xác nhận thanh toán
                          </button>
                        )}
                        {selectedPaymentMethod === "SEPAY" && !qrCodeUrl && (
                          <button
                            className="w-full bg-white text-gray-900 rounded-lg py-3 font-semibold hover:bg-gray-200 transition-colors"
                            onClick={handleConfirmPayment}
                          >
                            Lấy mã QR
                          </button>
                        )}
                        <p className="text-xs text-gray-400 text-center mt-2">
                          Thanh toán sẽ tự động
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Status Message */}
                {paymentStatus === "SUCCESS" && (
                  <div className="p-4 text-center text-green-500">
                    Thanh toán thành công!
                  </div>
                )}
                {paymentStatus === "FAILED" && (
                  <div className="p-4 text-center text-red-500">
                    Thanh toán thất bại. Vui lòng thử lại.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="mb-6 mt-8">
        <h2 className="text-2xl font-semibold mb-2">
          {data?._count?.comments} Bình luận
        </h2>
        <CommentPhoto id={id} reload={reload} top />
      </div>
    </div>
  );
};

export default ProductPhotoDetail;

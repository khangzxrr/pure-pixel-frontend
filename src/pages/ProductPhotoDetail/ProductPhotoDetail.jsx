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
import DetailUser from "../DetailUser/DetailUser";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import ComReport from "../../components/ComReport/ComReport";
function calculateTimeFromNow(dateString) {
  const startDate = new Date(dateString);
  const now = new Date();
  const diffInMilliseconds = now.getTime() - startDate.getTime();
  const diffInDays = Math.floor(diffInMilliseconds / (1000 * 60 * 60 * 24));
  const diffInHours = Math.floor(diffInMilliseconds / (1000 * 60 * 60));
  const diffInMinutes = Math.floor(diffInMilliseconds / (1000 * 60));
  if (!diffInMinutes) {
    return ``;
  }
  if (diffInDays >= 1) {
    return `${diffInDays} ngày`;
  } else if (diffInHours >= 1) {
    return `${diffInHours} giờ`;
  } else {
    if (diffInMinutes < 0) {
      return `0 phút`;
    }
    return `${diffInMinutes} phút`;
  }
}
const Icon = ({ children, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={`h-5 w-5 ${className}`}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {children}
  </svg>
);

const ProductPhotoDetail = () => {
  const [data, setData] = useState(null);
  const [selectedPricetagId, setSelectedPricetagId] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("SEPAY");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [transactionId, setTransactionId] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [pricetagStatus, setPricetagStatus] = useState({});
  const [purchasedImageUrl, setPurchasedImageUrl] = useState(null);
  const modal = useModalState();
  const { id } = useParams();
  const { keycloak } = useKeycloak();
  const handleLogin = () => keycloak.login();
  const userData = UserService.getTokenParsed();
  const navigate = useNavigate();
  const popup = useModalState();
  const popupReport = useModalState();
  const [isExpanded, setIsExpanded] = useState(false);

  const reload = () => {
    getData(`photo/${id}`)
      .then((response) => {
        setData(response.data);

        const photoSelling = response.data.photoSellings
          ? response.data.photoSellings[0]
          : null;

        const pricetags = photoSelling ? photoSelling.pricetags : [];

        if (pricetags && pricetags.length > 0) {
          const defaultPricetagId = pricetags[0].id;
          setSelectedPricetagId(defaultPricetagId);
        }

        const pricetagStatus = {};

        pricetags.forEach((pricetag) => {
          pricetagStatus[pricetag.id] = {
            isPurchased: false,
            purchasedImageUrl: null,
          };
        });

        // Kiểm tra xem người dùng đã mua pricetag nào
        if (userData) {
          const userId = userData.sub;
          if (photoSelling) {
            const photoSellHistories = photoSelling.photoSellHistories;

            photoSellHistories.forEach((history) => {
              const boughtByUser = history.photoBuy.some(
                (buy) => buy.buyerId === userId
              );
              if (boughtByUser) {
                // Tìm pricetag tương ứng
                const matchingPricetag = pricetags.find(
                  (pricetag) =>
                    pricetag.width === history.width &&
                    pricetag.height === history.height &&
                    pricetag.price === history.price
                );
                if (matchingPricetag) {
                  pricetagStatus[matchingPricetag.id].isPurchased = true;
                  pricetagStatus[matchingPricetag.id].purchasedImageUrl =
                    response.data.signedUrl.url; // Sử dụng URL từ data
                }
              }
            });
          }
        }

        setPricetagStatus(pricetagStatus);

        // Kiểm tra nếu pricetag mặc định đã mua
        if (pricetagStatus[selectedPricetagId]?.isPurchased) {
          setPurchasedImageUrl(
            pricetagStatus[selectedPricetagId].purchasedImageUrl
          );
        } else {
          setPurchasedImageUrl(null);
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
      // Bắt đầu polling mỗi 3 giây
      intervalId = setInterval(() => {
        getData(`payment/transaction/${transactionId}`)
          .then((response) => {
            const status = response.data.status;

            if (status === "SUCCESS") {
              setPaymentStatus("SUCCESS");
              message.success("Thanh toán thành công!");
              clearInterval(intervalId);

              // Cập nhật trạng thái pricetag
              setPricetagStatus((prevStatus) => {
                const newStatus = { ...prevStatus };
                newStatus[selectedPricetagId] = {
                  isPurchased: true,
                  purchasedImageUrl: data.signedUrl.url,
                };
                return newStatus;
              });

              setPurchasedImageUrl(data.signedUrl.url);

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
      }, 3000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [transactionId, paymentStatus]);

  if (!data) {
    return <div className="min-h-screen text-white p-8">Loading...</div>;
  }

  const allDetails = Object?.entries(data?.exif || {});
  const mainDetails = allDetails?.slice(0, 4);
  const extraDetails = allDetails.slice(4);

  const photoSelling =
    data.photoSellings && data.photoSellings.length > 0
      ? data.photoSellings[0]
      : null;

  const selectedPricetag =
    photoSelling && photoSelling?.pricetags
      ? photoSelling?.pricetags.find(
          (pricetag) => pricetag.id === selectedPricetagId
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
          if (paymentMethod === "SEPAY") {
            setTransactionId(
              response?.userToUserTransaction?.fromUserTransaction?.id
            );
            setQrCodeUrl(response.mockQrCode);
            setPaymentStatus("PENDING");
          } else if (paymentMethod === "WALLET") {
            modal?.handleClose();
            message.success("Thanh toán bằng ví thành công!");

            // Cập nhật trạng thái pricetag
            setPricetagStatus((prevStatus) => {
              const newStatus = { ...prevStatus };
              newStatus[pricetagId] = {
                isPurchased: true,
                purchasedImageUrl: data.signedUrl.url,
              };
              return newStatus;
            });

            setPurchasedImageUrl(data.signedUrl.url);
          }
        })
        .catch((error) => {
          console.error("Lỗi khi mua ngay:", error);
          switch (error?.data?.message) {
            case "ExistSuccessedPhotoBuyException":
              message.error("Bạn đã mua hình ảnh này rồi");
              // Cập nhật trạng thái pricetag
              setPricetagStatus((prevStatus) => {
                const newStatus = { ...prevStatus };
                newStatus[pricetagId] = {
                  isPurchased: true,
                  purchasedImageUrl: data.signedUrl.url,
                };
                return newStatus;
              });

              setPurchasedImageUrl(data.signedUrl.url);
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

  const handlePricetagChange = (id) => {
    setSelectedPricetagId(id);
    setQrCodeUrl("");
    setTransactionId(null);
    setPaymentStatus(null);

    if (pricetagStatus[id]?.isPurchased) {
      setPurchasedImageUrl(pricetagStatus[id].purchasedImageUrl);
    } else {
      setPurchasedImageUrl(null);
    }
  };

  const isPricetagPurchased = pricetagStatus[selectedPricetagId]?.isPurchased;

  console.log("====================================");
  console.log(111111111, purchasedImageUrl);
  console.log(111111111, selectedPricetag?.preview);
  console.log(111111111, data);
  console.log("====================================");
  return (
    <div className="min-h-screen text-white p-2 ">
      <div className=" mx-auto flex flex-col xl:flex-row items-stretch gap-8 xl:max-h-[700px] ">
        <div className="xl:w-2/3 flex-shrink-0 flex  bg-[#505050] justify-center items-center">
          <div className=" p-4 rounded-lg flex justify-center items-center ">
            <img
              src={
                selectedPricetag?.preview
                  ? selectedPricetag?.preview
                  : purchasedImageUrl
              }
              alt={data.title}
              className=" w-auto h-full transform  scale-[0.95] max-h-[650px] border-4 border-black "
            />
          </div>
        </div>
        {popup.isModalOpen && (
          <div className="fixed inset-0 flex items-stretch justify-between z-50 overflow-y-auto">
            <div
              className="w-full h-auto bg-[rgba(0,0,0,0.5)]"
              onClick={popup.handleClose}
            ></div>
            <div className="w-[700px]">
              <DetailUser id={data.photographer.id} data={data?.photographer} />
            </div>
          </div>
        )}
        <div className="xl:w-1/3 overflow-y-auto  overflow-x-hidden custom-scrollbar2">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-1">
              <img
                src={data.photographer.avatar}
                alt="GueM"
                onClick={popup.handleOpen}
                className="w-10 h-10 rounded-full cursor-pointer transition-transform duration-300 hover:scale-110 hover:shadow-lg"
              />
              <div>
                <h2
                  className="font-semibold cursor-pointer text-blue-600 hover:text-blue-800 transition-colors duration-300"
                  onClick={popup.handleOpen}
                  style={{ wordBreak: "break-all", overflowWrap: "break-word" }}
                >
                  {data.photographer.name}
                </h2>
                <p className="text-sm text-gray-400">
                  {calculateTimeFromNow(data?.createdAt)}
                </p>
              </div>
            </div>
            <div className="flex">
              <Menu as="div" className="relative">
                <MenuButton className="-m-1.5 flex items-center p-1.5">
                  <button className="hover:text-gray-400">
                    <Icon>
                      <circle cx="12" cy="12" r="1" />
                      <circle cx="19" cy="12" r="1" />
                      <circle cx="5" cy="12" r="1" />
                    </Icon>
                  </button>
                </MenuButton>
                <MenuItems
                  transition
                  className="absolute right-0 z-10 mt-2.5 w-32 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5 transition focus:outline-none"
                >
                  <MenuItem>
                    <button
                      onClick={() => {}}
                      className="block w-full px-3 text-left py-1 text-sm leading-6 text-gray-900 hover:bg-gray-50"
                    >
                      Lưu bài viết
                    </button>
                  </MenuItem>

                  <MenuItem>
                    <button
                      onClick={() => {
                        popupReport.handleOpen();
                      }}
                      className="block w-full px-3 py-1 text-left text-sm leading-6 text-gray-900 hover:bg-gray-50"
                    >
                      Báo cáo bài viết
                    </button>
                  </MenuItem>
                </MenuItems>
                {popupReport.isModalOpen && (
                  <ComReport
                    onclose={popupReport.handleClose}
                    tile="Báo cáo ảnh bán"
                    id={data?.id}
                    reportType={"PHOTO"}
                  />
                )}
              </Menu>
            </div>
          </div>

          <div>
            <h1
              className="text-2xl font-medium mb-2"
              style={{ wordBreak: "break-all", overflowWrap: "break-word" }}
            >
              {data.title}
            </h1>

            <h1
              className="mb-2"
              style={{ wordBreak: "break-all", overflowWrap: "break-word" }}
            >
              {photoSelling?.description}
            </h1>
          </div>
          <div className="bg-[#2f3136] text-gray-200 rounded-lg p-4 border">
            <h1 className="text-xl mb-2 mt-4">Thông số:</h1>
            <div className="space-y-2 mb-6 grid  grid-cols-1 sm:grid-cols-1 gap-3 ">
              {/* Hiển thị 3 thông số đầu tiên */}
              {mainDetails.map(([key, value], index) => (
                <div
                  className="flex justify-between items-start border-b border-[#ffffff3d]"
                  key={index}
                >
                  <span className="font-semibold mr-2">{key}:</span>

                  <span
                    className="font-light"
                    style={{
                      wordBreak: "break-all",
                      overflowWrap: "break-word",
                    }}
                  >
                    {value}
                  </span>
                </div>
              ))}

              {/* Hiển thị thông số còn lại khi mở rộng */}
              {isExpanded &&
                extraDetails.map(([key, value], index) => (
                  <div
                    className="flex justify-between items-start border-b border-[#ffffff3d]"
                    key={index}
                  >
                    <span className="font-semibold mr-2">{key}:</span>
                    <span
                      className="font-light"
                      style={{
                        wordBreak: "break-all",
                        overflowWrap: "break-word",
                      }}
                    >
                      {value}
                    </span>
                  </div>
                ))}
            </div>
            {/* Nút Xem thêm/Ẩn bớt */}
            <div className="flex justify-center">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className=" text-white rounded-md"
              >
                {isExpanded ? "Ẩn bớt" : "Xem thêm"}
              </button>
            </div>
          </div>
          <p className="text-3xl font-semibold mb-2">
            {selectedPricetag ? selectedPricetag.price.toLocaleString() : 0}Đ
          </p>

          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Kích thước</h2>
            <div className="flex flex-wrap gap-4 px-3">
              {photoSelling?.pricetags.map((pricetag) => {
                const isPurchased = pricetagStatus[pricetag.id]?.isPurchased;
                return (
                  <button
                    key={pricetag.id}
                    className={`px-4 py-2 text-sm rounded-full w-[80px] h-[80px] flex flex-col items-center justify-center 
                     
                       ${
                         selectedPricetagId === pricetag.id
                           ? "bg-[#292b2f] text-white border-2 border-white"
                           : "bg-[#292b2f] text-white border-2 border-[#292b2f]"
                       }     `}
                    onClick={() => handlePricetagChange(pricetag.id)}
                  >
                    <p>{pricetag.width}</p>
                    <p>x</p>
                    <p>{pricetag.height}</p>
                    {/* {isPurchased && (
                        <span className="text-xs text-green-500">Đã mua</span>
                      )} */}
                  </button>
                );
              })}
            </div>
          </div>
          {userData ? (
            pricetagStatus[selectedPricetagId]?.isPurchased ? (
              <div className="text-green-500 text-center font-semibold">
                Bạn đã mua kích thước này
              </div>
            ) : (
              <button
                className="w-full bg-white text-gray-900 py-3 rounded-lg hover:bg-gray-200 transition-colors"
                onClick={() => {
                  modal?.handleOpen();
                }}
              >
                Mua ngay
              </button>
            )
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
                            {photoSelling?.description}
                          </h4>
                          <p className="text-sm text-gray-400">
                            {selectedPricetag
                              ? `${selectedPricetag.width} x ${selectedPricetag.height}px`
                              : ""}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="font-semibold">
                            <ComPriceConverter>
                              {selectedPricetag ? selectedPricetag.price : 0}
                            </ComPriceConverter>
                          </span>
                        </div>
                      </div>

                      <div className="border-t border-gray-700 pt-4">
                        <div className="flex justify-between items-center mb-4">
                          <span className="font-semibold">
                            Tổng tiền phải trả
                          </span>
                          <span className="font-semibold text-xl">
                            <ComPriceConverter>
                              {selectedPricetag ? selectedPricetag.price : 0}
                            </ComPriceConverter>
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

import React, { useState } from "react";
import formatPrice from "./../../utils/FormatPriceUtils";
import { FormatDateTime } from "../../utils/FormatDateTimeUtils";
import PhotoExchange from "../../apis/PhotoExchange";
import { useModalState } from "./../../hooks/useModalState";
import DetailUser from "../../pages/DetailUser/DetailUser";
import { message } from "antd";
import ExifList from "../Photographer/UploadPhoto/ExifList";

const PhotoBoughtPreviewComponent = ({ photo, photoBoughtId }) => {
  console.log(photo, photo[0]);
  const photoDetail = photo[0].photoSellHistory.originalPhotoSell.photo;
  const [selectedSize, setSelectedSize] = useState(null);
  const [previewPhoto, setPreviewPhoto] = useState(photo[0]?.previewUrl);
  const popup = useModalState();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleOnSizeChange = (photobuy) => {
    console.log(
      "photobuy",
      photobuy.photoSellHistory.originalPhotoSellId,
      selectedSize?.photoSellHistory.originalPhotoSellId
    );
    setSelectedSize(photobuy);
    setPreviewPhoto(photobuy.previewUrl);
  };

  const handleDownload = async () => {
    if (selectedSize) {
      try {
        const data = await PhotoExchange.getPhotoBoughtDetailDownload(
          photoBoughtId,
          selectedSize.id
        );

        // Tạo link tải về từ dữ liệu nhận được
        const href = URL.createObjectURL(data);

        // Tạo tên file động (dùng `selectedSize` hoặc thông tin từ `data`)
        const fileName = `${photo.title}-${
          selectedSize.photoSellHistory.width +
          `x` +
          selectedSize.photoSellHistory.height
        }.jpg`; // Hoặc có thể thay đổi thành định dạng khác nếu cần

        // Tạo phần tử <a> và tự động click để tải
        const link = document.createElement("a");
        link.href = href;
        link.setAttribute("download", fileName); // Sử dụng tên file động
        document.body.appendChild(link);
        link.click();

        // Dọn dẹp bộ nhớ và phần tử <a>
        document.body.removeChild(link);
        URL.revokeObjectURL(href);
      } catch (error) {
        console.error("Error downloading file:", error);
        message.error("Đã xảy ra lỗi khi tải ảnh. Vui lòng thử lại sau.");
      }
    } else {
      message.error("Vui lòng chọn một kích thước trước khi tải ảnh.");
    }
  };

  // Hàm tính thời gian từ lúc đăng ảnh
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
  return (
    <div className="min-h-screen text-white p-2 ">
      <div className=" mx-auto flex flex-col xl:flex-row items-stretch gap-8 xl:max-h-screen ">
        <div className="xl:w-2/3 flex-shrink-0 flex  bg-[#505050] justify-center items-center">
          <div className=" p-4 rounded-lg flex justify-center items-center ">
            <img
              src={previewPhoto}
              alt={photoDetail.title}
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
              <DetailUser
                id={photo.photographer.id}
                data={photo.photographer}
              />
            </div>
          </div>
        )}
        <div className="xl:w-1/3 overflow-y-auto  overflow-x-hidden custom-scrollbar2">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-1">
              <img
                src={photo.photographer?.avatar}
                alt={photo.photographer?.name}
                onClick={popup.handleOpen}
                className="w-10 h-10 rounded-full cursor-pointer transition-transform duration-300 hover:scale-110 hover:shadow-lg"
              />
              <div>
                <h2
                  className="font-semibold cursor-pointer text-blue-600 hover:text-blue-800 transition-colors duration-300"
                  onClick={popup.handleOpen}
                  style={{ wordBreak: "break-all", overflowWrap: "break-word" }}
                >
                  {photo.photographer?.name}
                </h2>
                <p className="text-sm text-gray-400">
                  {calculateTimeFromNow(photo?.createdAt)}
                </p>
              </div>
            </div>
          </div>

          <div>
            <h1
              className="text-2xl font-medium mb-2"
              style={{ wordBreak: "break-all", overflowWrap: "break-word" }}
            >
              {photoDetail.title}
            </h1>

            <h1
              className="mb-2"
              style={{ wordBreak: "break-all", overflowWrap: "break-word" }}
            >
              {photoDetail.description}
            </h1>
          </div>
          <ExifList exifData={photoDetail.exif} />

          <div className="flex flex-col gap-2 mt-4">
            <h2 className="text-xl">Chọn kích thước để tải:</h2>
            <div className="flex flex-wrap gap-4 px-3">
              {photo?.map((photoBySize, index) => {
                console.log("check photo", photoBySize.id, selectedSize?.id);

                return (
                  <button
                    key={photoBySize.id}
                    className={`px-4 py-2 text-sm rounded-full w-[80px] h-[80px] flex flex-col items-center justify-center 
                          ${
                            selectedSize?.id === photoBySize.id
                              ? "bg-[#292b2f] text-white border-2 border-white"
                              : "bg-[#292b2f] text-white border-2 border-[#292b2f]"
                          }`}
                    onClick={() => handleOnSizeChange(photoBySize)}
                  >
                    <p>{photoBySize?.photoSellHistory?.width}</p>
                    <p>x</p>
                    <p>{photoBySize?.photoSellHistory?.height}</p>
                  </button>
                );
              })}
            </div>
            {selectedSize && (
              <div className="mt-4 p-4 bg-gray-800 rounded-lg text-white">
                <div className="text-lg font-semibold">
                  Chi tiết kích thước:
                </div>
                <div className="font-normal">
                  Kích thước:
                  <div className="font-semibold ml-3">
                    <p> Cao: {selectedSize?.photoSellHistory?.height}px</p>
                    <p> Rộng: {selectedSize?.photoSellHistory?.width}px</p>
                  </div>
                </div>
                <div className="font-normal">
                  Giá:{" "}
                  <span className="font-semibold">
                    {formatPrice(selectedSize?.photoSellHistory?.price)}
                  </span>
                </div>
                <div className="font-normal">
                  Thời gian mua:{" "}
                  <span className="font-semibold">
                    {FormatDateTime(
                      selectedSize.userToUserTransaction.createdAt
                    )}
                  </span>
                </div>
                <div className="font-normal">
                  Phương thức thanh toán:{" "}
                  <span className="font-semibold">
                    {
                      selectedSize.userToUserTransaction.fromUserTransaction
                        .paymentMethod
                    }
                  </span>
                </div>
              </div>
            )}
            <button
              className="w-full bg-white text-gray-900 py-3 rounded-lg hover:bg-gray-200 transition-colors mt-4"
              onClick={handleDownload}
            >
              Tải ảnh
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoBoughtPreviewComponent;

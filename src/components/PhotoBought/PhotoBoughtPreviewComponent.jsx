import React, { useEffect, useState } from "react";
import formatPrice from "./../../utils/FormatPriceUtils";
import { FormatDateTime } from "../../utils/FormatDateTimeUtils";
import PhotoExchange from "../../apis/PhotoExchange";
import { useModalState } from "./../../hooks/useModalState";
import { message } from "antd";
import ExifList from "../Photographer/UploadPhoto/ExifList";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { LoadingOutlined } from "@ant-design/icons";
import { use } from "react";
const PhotoBoughtPreviewComponent = ({ photoData, photoBoughtId }) => {
  console.log(
    "checkPhotoData",
    photoData && photoData.photo,
    photoData.photoBuys
  );
  const navigate = useNavigate();
  const photoDetail = photoData && photoData.photo;
  const photoBuys = photoData ? photoData.photoBuys : [];
  const [selectedSize, setSelectedSize] = useState(photoBuys[0]);

  const [previewPhoto, setPreviewPhoto] = useState(photoBuys[0]?.previewUrl);
  const popup = useModalState();
  console.log("checkPhotoDetail", photoBuys[0]?.previewUrl);
  const handleOnSizeChange = (photobuy) => {
    console.log(
      "photobuy",
      photobuy.photoSellHistory.originalPhotoSellId,
      selectedSize?.photoSellHistory.originalPhotoSellId
    );
    setSelectedSize(photobuy);
    setPreviewPhoto(photobuy.previewUrl);
  };
  const downloadPhotoMutation = useMutation({
    mutationFn: ({ id, photoBuyId }) =>
      PhotoExchange.getPhotoBoughtDetailDownload(id, photoBuyId),
    onMutate: () => {
      message.loading("Đang tải ảnh...");
    },
  });
  const { mutateAsync: downloadPhotoMutateAsync, isPending: isDownloading } =
    downloadPhotoMutation;
  const handleDownload = async () => {
    console.log("checkPhotoDetail", isDownloading);

    if (!selectedSize) {
      message.error("Vui lòng chọn một kích thước trước khi tải ảnh.");
      return;
    }

    try {
      console.log("selectedSize", selectedSize);

      await downloadPhotoMutateAsync(
        { id: photoBoughtId, photoBuyId: selectedSize.id },
        {
          onSuccess: (data) => {
            // Handle successful download
            const href = URL.createObjectURL(data);
            const fileName = `${photoDetail.title}-${
              selectedSize.photoSellHistory.width +
              `x` +
              selectedSize.photoSellHistory.height
            }.jpg`;

            const link = document.createElement("a");
            link.href = href;
            link.setAttribute("download", fileName);
            document.body.appendChild(link);
            link.click();

            // Clean up resources
            document.body.removeChild(link);
            URL.revokeObjectURL(href);

            message.success("Ảnh đã được tải thành công.");
          },
          onError: (error) => {
            // Handle error during download
            console.error("Error downloading file:", error);
            message.error("Đã xảy ra lỗi khi tải ảnh. Vui lòng thử lại sau.");
          },
        }
      );
    } catch (error) {
      console.error("Unexpected error during download:", error);
      message.error("Đã xảy ra lỗi không xác định. Vui lòng thử lại sau.");
    }
  };
  useEffect(() => {
    if (!selectedSize && photoData && photoBuys.length > 0 && photoBuys[0]) {
      setSelectedSize(photoBuys[0]);
    }
  }, [selectedSize, photoBuys]);
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
              src={previewPhoto ? previewPhoto : photoBuys[0]?.previewUrl}
              alt={photoDetail?.title}
              className=" w-auto h-full transform  scale-[0.95] max-h-[650px] border-4 border-black "
            />
          </div>
        </div>
        <div className="xl:w-1/3">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-1">
              <img
                src={photoDetail?.photographer?.avatar}
                alt={photoDetail?.photographer?.name}
                onClick={() =>
                  navigate(`/user/${photoDetail?.photographer?.id}/selling`)
                }
                className="w-10 h-10 rounded-full cursor-pointer transition-transform duration-300 hover:scale-110 hover:shadow-lg"
              />
              <div>
                <h2
                  className="font-semibold cursor-pointer text-blue-600 hover:text-blue-800 transition-colors duration-300"
                  onClick={() =>
                    navigate(`/user/${photoDetail?.photographer?.id}/selling`)
                  }
                  style={{ wordBreak: "break-all", overflowWrap: "break-word" }}
                >
                  {photoDetail?.photographer?.name}
                </h2>
                <p className="text-sm text-gray-400">
                  {calculateTimeFromNow(photoDetail?.createdAt)}
                </p>
              </div>
            </div>
          </div>

          <div>
            <h1
              className="m-2 text-xl font-medium mb-2"
              style={{ wordBreak: "break-all", overflowWrap: "break-word" }}
            >
              {photoDetail?.title}
            </h1>

            <p
              className="m-2 font-normal text-gray-200"
              style={{ wordBreak: "break-all", overflowWrap: "break-word" }}
            >
              {photoDetail?.description}
            </p>
          </div>
          <ExifList exifData={photoDetail?.exif} />

          <div className="flex flex-col gap-2 mt-4">
            <h2 className="text-xl">Chọn kích thước để tải:</h2>
            <div className="flex flex-wrap gap-4 px-3">
              {photoBuys?.map((photoBySize, index) => {
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
              disabled={isDownloading || !selectedSize}
            >
              {isDownloading ? (
                <p>
                  <LoadingOutlined
                    style={{
                      fontSize: 24,
                    }}
                    spin
                  />
                  <span className="mx-4">Đang tải ảnh về</span>
                </p>
              ) : (
                "Tải ảnh"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoBoughtPreviewComponent;

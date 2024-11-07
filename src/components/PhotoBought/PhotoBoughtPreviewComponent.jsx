import React, { useState } from "react";
import formatPrice from "./../../utils/FormatPriceUtils";
import { FormatDateTime } from "../../utils/FormatDateTimeUtils";
import PhotoExchange from "../../apis/PhotoExchange";

const PhotoBoughtPreviewComponent = ({ photo, sizeList, photoBoughtId }) => {
  const [selectedSize, setSelectedSize] = useState(null);
  const [previewPhoto, setPreviewPhoto] = useState(photo.signedUrl.thumbnail);

  const handleOnSizeChange = (photobuy) => {
    const activeSelling = photo?.photoSellings.find((s) => s.active === true);

    const pricetags = activeSelling.pricetags;

    const pricetagEqualSize = pricetags.find(
      (p) => p.size === photobuy.photoSellHistory.size
    );

    setSelectedSize(photobuy);
    setPreviewPhoto(pricetagEqualSize.preview);
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
          selectedSize.photoSellHistory.size + `px`
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
        alert("Đã xảy ra lỗi khi tải ảnh. Vui lòng thử lại sau.");
      }
    } else {
      alert("Vui lòng chọn một kích thước trước khi tải ảnh.");
    }
  };

  return (
    <div className="">
      <div className="flex flex-col  ">
        <div className="flex items-center justify-center p-4  col-span-2 bg-[#202225]">
          <img src={previewPhoto} alt="" className="" />
        </div>

        <div className="flex flex-col gap-5 px-5 py-2">
          <div className="flex flex-col gap-1">
            <div className="font-bold text-2xl w-[300px] break-words">
              {photo.title}
            </div>

            <div className="font-normal">{photo.description}</div>
            <div className="font-normal flex items-center gap-2">
              Mua từ:{" "}
              <span className="font-semibold flex items-center gap-2">
                <div className="size-[20px] bg-[#eee] overflow-hidden rounded-full">
                  <img
                    src={photo.photographer.avatar}
                    alt=""
                    className="size-full object-cover"
                  />
                </div>{" "}
                {photo.photographer.name}
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-2 ">
            <div className="text-xl">Chọn kích thước để tải:</div>
            <div className="flex flex-wrap gap-2">
              <ul className="grid w-full gap-6 md:grid-cols-3">
                {sizeList?.map((size, index) => (
                  <li key={size.id}>
                    <input
                      type="radio"
                      id={`size-${size.id}`}
                      name="size123"
                      value={size.id}
                      className="hidden peer"
                      onChange={() => handleOnSizeChange(size)}
                      required=""
                    />
                    <label
                      htmlFor={`size-${size.id}`}
                      className="inline-flex items-center justify-center  py-2 text-[#eee] rounded-full cursor-pointer bg-[#1f2937]    peer-checked:text-black peer-checked:bg-[#eee] "
                    >
                      <div className="block">
                        <div className="w-full text-lg font-semibold">
                          {size.photoSellHistory.size}px
                        </div>
                      </div>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
            {selectedSize && (
              <div className="mt-4 p-4 bg-gray-800 rounded-lg text-white">
                <div className="text-lg font-semibold">
                  Chi tiết kích thước:
                </div>
                <div className="font-normal">
                  Kích thước:{" "}
                  <span className="font-semibold">
                    {selectedSize.photoSellHistory.size}
                    px
                  </span>
                </div>
                <div className="font-normal">
                  Giá:{" "}
                  <span className="font-semibold">
                    {formatPrice(selectedSize.photoSellHistory.price)}
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
            <div
              className="text-center hover:cursor-pointer text-black hover:bg-[#b7b7b7] w-full bg-[#eee] py-2 rounded-lg"
              onClick={handleDownload}
            >
              Tải ảnh
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoBoughtPreviewComponent;

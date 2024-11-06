import { useKeycloak } from "@react-keycloak/web";
import React, { useState } from "react";
import UserService from "../../services/Keycloak";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import PhotoExchange from "../../apis/PhotoExchange";
import PhotoApi from "../../apis/PhotoApi";

const formatPrice = (price) => {
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "đ";
};

const PhotoBoughtDetail = () => {
  const { boughtId } = useParams();
  const { keycloak } = useKeycloak();
  const userData = UserService.getTokenParsed();
  const navigate = useNavigate();

  const formatDateTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["photo-bought-detai () => PhotoApi.getl", boughtId],
    queryFn: () => PhotoExchange.getPhotoBoughtDetail(boughtId),
  });
  const sizeList = data;

  const { data: dataPhotoId } = useQuery({
    queryKey: ["photo-by-id", boughtId],
    queryFn: () => PhotoApi.getPhotoById(boughtId), // Không cần `await` khi đã trả về `Promise`
  });
  const photoById = dataPhotoId?.signedUrl?.thumbnail;
  const photoTitle = dataPhotoId?.title;
  const photoDescription = dataPhotoId?.description;
  const photographerName = dataPhotoId?.photographer?.name;
  const photographerAvatar = dataPhotoId?.photographer?.avatar;

  const [selectedSize, setSelectedSize] = useState(null);

  const handleDownload = async () => {
    if (selectedSize) {
      try {
        const data = await PhotoExchange.getPhotoBoughtDetailDownload(
          boughtId,
          selectedSize.id
        );

        // Tạo link tải về từ dữ liệu nhận được
        const href = URL.createObjectURL(data);

        // Tạo tên file động (dùng `selectedSize` hoặc thông tin từ `data`)
        const fileName = `${photoTitle}-${
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 bg-[#292b2f] h-screen">
        <div className="max-h-[95vh] w-full overflow-hidden bg-black col-span-2">
          <img
            src={photoById}
            alt=""
            className="w-full h-full object-contain"
          />
        </div>

        <div className="flex flex-col gap-5 px-5 py-2">
          <div className="flex flex-col gap-1">
            <div className="font-bold text-2xl w-[300px] break-words">
              {photoTitle}
            </div>

            <div className="font-normal">{photoDescription}</div>
            <div className="font-normal"></div>
          </div>
          <div className="flex flex-col gap-2 w-full">
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
                      onChange={() => setSelectedSize(size, photoTitle)}
                      required=""
                    />
                    <label
                      htmlFor={`size-${size.id}`}
                      className="inline-flex items-center justify-center w-full py-2 text-[#eee] rounded-full cursor-pointer bg-[#1f2937]    peer-checked:text-black peer-checked:bg-[#eee] "
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
                    {formatDateTime(
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
                <div className="font-normal flex items-center gap-2">
                  Mua từ:{" "}
                  <span className="font-semibold flex items-center gap-2">
                    <div className="size-[20px] bg-[#eee] overflow-hidden rounded-full">
                      <img
                        src={photographerAvatar}
                        alt=""
                        className="size-full object-cover"
                      />
                    </div>{" "}
                    {photographerName}
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

export default PhotoBoughtDetail;

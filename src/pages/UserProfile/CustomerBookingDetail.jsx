import React, { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { CustomerBookingApi } from "../../apis/CustomerBookingApi";
import { message, Tooltip } from "antd";
import formatPrice from "../../utils/FormatPriceUtils";
import { FormatDateTime } from "../../utils/FormatDateTimeUtils";
import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import { ArrowRight, Calendar, MessageCircleMore } from "lucide-react";
import { notificationApi } from "../../Notification/Notification";
import ChatButton from "../../components/ChatButton/ChatButton";
import ReviewBooking from "./Component/ReviewBooking";
import calculateDateDifference from "../../utils/calculateDateDifference";
import useNotificationStore from "../../states/UseNotificationStore";

const CustomerBookingDetail = () => {
  const { bookingId } = useParams();
  const [isDownloading, setIsDownloading] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  const queryClient = useQueryClient();

  const { socket } = useNotificationStore();

  useEffect(() => {
    async function notificationBookingDetailEventHandler(data) {
      console.log(data);

      if (data?.referenceType === "BOOKING") {
        await queryClient.invalidateQueries({
          queryKey: ["customer-booking-detail"],
        });

        await queryClient.invalidateQueries({
          queryKey: ["customer-booking-bill-items"],
        });
      }
    }

    if (socket?.connected) {
      console.log(`listen to notification event in CustomerBookingDetail`);
      socket.on("notification-event", notificationBookingDetailEventHandler);
    }

    return () => {
      if (socket) {
        socket.off("notification-event", notificationBookingDetailEventHandler);
        console.log(`remove`);
      }
    };
  }, [socket]);

  const { data: bookingDetail, isPending } = useQuery({
    queryKey: ["customer-booking-detail", bookingId],
    queryFn: () => CustomerBookingApi.findById(bookingId),
  });

  const { data: billItems } = useQuery({
    queryKey: ["customer-booking-bill-items", bookingId],
    queryFn: () => CustomerBookingApi.getBillItems(bookingId),
  });

  const downloadPhoto = useMutation({
    mutationFn: (bookingId) => CustomerBookingApi.downloadAllPhoto(bookingId),
    onSuccess: async (data) => {
      console.log(data);
      try {
        // Create a URL for the Blob
        const href = URL.createObjectURL(data);

        // Create a temporary <a> element to trigger the download
        const link = document.createElement("a");
        link.href = href;

        // Fallback to 'download.zip' if any of the required values are missing
        if (
          !bookingDetail.photoshootPackageHistory?.title ||
          !bookingDetail.originalPhotoshootPackage?.user?.name
        ) {
          link.download = "Thư mục ảnh chụp của tôi.zip";
        } else {
          link.download = `${bookingDetail.photoshootPackageHistory?.title}-${bookingDetail.originalPhotoshootPackage?.user?.name}(Thợ chụp).zip`;
        }
        document.body.appendChild(link);
        link.click();

        // Cleanup
        document.body.removeChild(link);
        URL.revokeObjectURL(href);

        notificationApi(
          "success",
          "Tải ảnh thành công",
          "Tất cả ảnh đã được tải về thành công."
        );
      } catch (error) {
        console.error("Error downloading file:", error);
        notificationApi(
          "error",
          "Lỗi khi tải ảnh",
          "Lỗi khi tải ảnh, vui lòng thử lại sau."
        );
      } finally {
        setIsDownloading(false);
      }
    },
    onError: (error) => {
      console.error("Error:", error);
      notificationApi(
        "error",
        "Lỗi khi tải ảnh",
        "Lỗi khi tải ảnh, vui lòng thử lại sau.   "
      );
      setIsDownloading(false);
    },
  });

  // Track the current index of the selected photo
  const currentIndex = bookingDetail?.photos?.findIndex(
    (photo) => photo?.id === selectedPhoto?.id
  );
  // Function to go to the previous photo
  const handlePreviousPhoto = () => {
    if (currentIndex < bookingDetail.photos.length - 1) {
      setSelectedPhoto(bookingDetail.photos[currentIndex + 1]);
    } else {
      setSelectedPhoto(bookingDetail.photos[0]);
    }
  };
  // Function to go to the next photo
  const handleNextPhoto = () => {
    if (currentIndex > 0) {
      setSelectedPhoto(bookingDetail.photos[currentIndex - 1]);
    } else {
      setSelectedPhoto(bookingDetail.photos[bookingDetail.photos.length - 1]);
    }
  };
  useEffect(() => {
    if (bookingDetail?.photos && Array.isArray(bookingDetail.photos)) {
      setSelectedPhoto(bookingDetail.photos[bookingDetail.photos.length - 1]);
    }
  }, [bookingDetail]);
  //Download single photo
  const handleDownload = async (photo) => {
    if (photo && photo.signedUrl?.url) {
      try {
        console.log("photo", photo, photo.signedUrl.url);

        // Fetch the image data as a Blob
        const response = await fetch(photo.signedUrl.url);
        if (!response.ok) throw new Error("Failed to fetch the image");

        const blob = await response.blob();

        // Create a download link from the Blob
        const href = URL.createObjectURL(blob);

        // Create a dynamic filename or use a default
        const fileName = `${photo.title || "download"}.jpg`;

        // Create a temporary <a> element and trigger download
        const link = document.createElement("a");
        link.href = href;
        link.setAttribute("download", fileName);
        document.body.appendChild(link);
        link.click();

        // Cleanup
        document.body.removeChild(link);
        URL.revokeObjectURL(href);
      } catch (error) {
        console.error("Error downloading file:", error);
        message.error("Đã xảy ra lỗi khi tải ảnh. Vui lòng thử lại sau.");
      }
    } else {
      message.error("Vui lòng chọn một ảnh hợp lệ trước khi tải xuống.");
    }
  };
  //Download all Photo
  const downloadAllPhoto = () => {
    setIsDownloading(true);
    downloadPhoto.mutate(bookingId); // bookingId is passed to mutationFn
  };
  if (isPending) {
    return <div>Đang tải thông tin lịch hẹn...</div>;
  }
  console.log(bookingDetail.originalPhotoshootPackage.user.id);

  const userReview = bookingDetail.reviews.find(
    (review) => review.userId === bookingDetail.user.id
  );
  console.log(bookingDetail.user.id, bookingDetail.reviews, userReview);
  return (
    <div className="grid grid-cols-1 md:grid-cols-8 overflow-hidden">
      <div className="md:col-span-3 flex h-[95vh] overflow-y-scroll custom-scrollbar">
        <div className="flex flex-col gap-1 w-full">
          <div className="flex flex-col gap-2 m-2 bg-[#2d2f34] rounded-lg">
            <div className="h-[200px] overflow-hidden">
              <img
                src={bookingDetail.photoshootPackageHistory.thumbnail}
                alt=""
                className="size-full object-cover rounded-t-lg"
              />
            </div>
            <div className="flex flex-col py-2 px-4 gap-2">
              <div className="flex items-center justify-between">
                <div className="text-xl font-bold">
                  {bookingDetail.photoshootPackageHistory.title}
                </div>
                <div
                  className={`${
                    bookingDetail.status === "ACCEPTED"
                      ? "text-blue-500"
                      : bookingDetail.status === "SUCCESSED"
                      ? "text-green-500"
                      : "text-yellow-500"
                  } font-normal text-sm`}
                >
                  {bookingDetail.status === "ACCEPTED" ? (
                    "Đang thực hiện"
                  ) : bookingDetail.status === "SUCCESSED" ? (
                    isDownloading ? (
                      <p className="flex items-center gap-1 text-yellow-500">
                        Ảnh đang được tải về...
                      </p>
                    ) : (
                      <Tooltip title="Nhấn để tải tất cả ảnh về" color="green">
                        <p
                          onClick={downloadAllPhoto} // Trigger the mutation function
                          className="flex items-center gap-1 cursor-pointer bg-green-500 text-[#fff] px-2 py-1 rounded-md hover:opacity-80"
                        >
                          <span>Nhấn để tải ảnh</span>
                        </p>
                      </Tooltip>
                    )
                  ) : (
                    "Chờ xác nhận"
                  )}
                </div>
              </div>
              <div className="underline underline-offset-2">
                {formatPrice(bookingDetail.photoshootPackageHistory.price)}
              </div>
              <div className="flex items-center gap-2">
                <div className="size-7 overflow-hidden rounded-full">
                  <img
                    src={bookingDetail.originalPhotoshootPackage.user.avatar}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>{bookingDetail.originalPhotoshootPackage.user.name}</div>

                <ChatButton
                  userId={bookingDetail.originalPhotoshootPackage.user.id}
                />
              </div>
              <div className="flex flex-col mt-2 gap-1">
                <div>Ghi chú</div>
                <p className="list-inside font-normal truncate text-sm max-w-[300px]">
                  {bookingDetail.description || "Không có"}
                </p>
                <div className="flex flex-col mt-2 gap-1">
                  <div>Thời gian hẹn:</div>
                  <div className="flex justify-between items-center w-full">
                    {/* Start: Calendar Icon and Arrow */}
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <div className="font-normal">
                        {FormatDateTime(bookingDetail.startDate)}
                      </div>
                      <ArrowRight className="w-4 h-4" />
                      <div className="font-normal">
                        {FormatDateTime(bookingDetail.endDate)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right font-normal text-sm text-[#a3a3a3]">
                    {calculateDateDifference(bookingDetail.createdAt)}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2 mx-2 p-4 bg-[#2d2f34] rounded-lg">
            <div className="flex flex-col">
              <ul className="border-b pb-2">
                {billItems &&
                  billItems.objects?.map((bill) => (
                    <li
                      key={bill.id}
                      className="flex items-center justify-between font-normal text-sm"
                    >
                      <span>{bill.title}</span>
                      <div className="flex items-center gap-2">
                        <span
                          className={`${
                            bill.type === "INCREASE"
                              ? "text-green-500"
                              : "text-red-500"
                          }`}
                        >
                          {bill.type === "INCREASE" ? "+" : "-"}
                          {formatPrice(bill.price)}
                        </span>
                        <div className="w-8"></div>
                      </div>
                    </li>
                  ))}
              </ul>
              <div className="grid grid-cols-10 font-normal text-sm py-1">
                <p className="col-span-6">Tổng cộng:</p>
                <p className="col-span-3 text-end text-base mx-2">
                  <span>{formatPrice(bookingDetail.totalBillItem)}</span>
                </p>
              </div>
            </div>
          </div>
          {bookingDetail.status === "SUCCESSED" && (
            <ReviewBooking
              bookingId={bookingId}
              userReview={userReview}
              role="customer"
            />
          )}
        </div>
      </div>
      <div className="md:col-span-5 flex flex-col h-[95vh]">
        <div
          className={`${
            bookingDetail.photos.length === 0 && "hidden"
          } bg-[#292b2f] p-7 relative flex justify-center items-center overflow-hidden`}
        >
          {bookingDetail.photos.length > 1 && (
            <>
              <div
                onClick={handlePreviousPhoto}
                className={`absolute left-1 top-1/2 transform -translate-y-1/2 text-4xl hover:scale-110 text-white bg-slate-500 p-1 rounded-md opacity-70 hover:opacity-90 cursor-pointer z-10`}
              >
                <ArrowLeftOutlined />
              </div>
              <div
                onClick={handleNextPhoto}
                className={`absolute right-1 top-1/2 transform -translate-y-1/2 text-4xl hover:scale-110 text-white bg-slate-500 p-1 rounded-md opacity-70 hover:opacity-90 cursor-pointer z-10`}
              >
                <ArrowRightOutlined />
              </div>
            </>
          )}
          <img
            src={selectedPhoto?.signedUrl.url}
            className="h-[444px] shadow-gray-600 shadow-xl drop-shadow-none z-0"
            alt="Selected Photo"
          />
        </div>
        <div className="flex overflow-x-scroll custom-scrollbar w-full bg-[#36393f]">
          {bookingDetail.photos &&
            bookingDetail.photos.map((photo, index) => (
              <div key={index} className="relative p-2 flex-shrink-0">
                <img
                  src={photo?.signedUrl.url}
                  className={`w-[150px] h-[150px] object-cover rounded-md cursor-pointer ${
                    photo?.id === selectedPhoto?.id
                      ? "border-4 border-white transition duration-300"
                      : ""
                  }`}
                  alt="Ban Thao"
                  onClick={() => setSelectedPhoto(photo)}
                />
                {bookingDetail.status === "SUCCESSED" && (
                  <div className="h-8 w-8 absolute top-2 right-2 grid place-items-center z-20 bg-red-300 bg-opacity-30 backdrop-blur-md rounded-full">
                    <Tooltip title="Tải ảnh này về" color="blue">
                      <DownloadOutlined
                        className="text-white text-xl cursor-pointer hover:text-red-500"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent triggering the parent onClick
                          handleDownload(photo);
                        }}
                      />
                    </Tooltip>
                  </div>
                )}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default CustomerBookingDetail;

import { useMutation, useQuery } from "@tanstack/react-query";
import React from "react";
import ManagerReportApi from "../../../apis/ManagerReportApi";
import { Modal, Descriptions, Avatar, Divider, List, Popconfirm } from "antd";

import {
  Flag,
  User,
  Calendar,
  Clock,
  Eye,
  ThumbsDown,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import ComDateConverter from "../../../components/ComDateConverter/ComDateConverter";
import { notificationApi } from "../../../Notification/Notification";
const statusRender = (status) => {
  switch (status) {
    case "REQUESTED":
      return <p className="text-[#FFA500]">Đang yêu cầu</p>;
    case "ACCEPTED":
      return <p className="text-[#007BFF]">Đang thực hiện</p>;
    case "SUCCESSED":
      return <p className="text-[#28A745]">Đã hoàn thành</p>;
    case "DENIED":
      return <p className="text-[#DC3545]">Bị từ chối yêu cầu</p>;
    case "FAILED":
      return <p className="text-[#FFA500]">Đã bị hủy yêu cầu</p>;
    default:
      return <p className="text-[#FFA500]">{status}</p>;
  }
};

export default function BookingReport({ selectedData, tableRef, onClose }) {
  const { data: bookingDetail } = useQuery({
    queryKey: ["booking-detail-by-manager", selectedData],
    queryFn: () => ManagerReportApi.getBookingDetail(selectedData.referenceId),
  });
  const {
    user,
    originalPhotoshootPackage,
    photoshootPackageHistory,
    billItems,
    totalBillItem,
    photos,
  } = bookingDetail || {};
  console.log("bookingDetail", bookingDetail && originalPhotoshootPackage.user);
  console.log("selectedData", selectedData);
  const updateBookingPackageStatus = useMutation({
    mutationFn: ({ bookingId, status }) =>
      ManagerReportApi.updateBooking(bookingId, { status }),
    onSuccess: () => {
      notificationApi(
        "success",
        "Cập nhật thành công",
        "Cập nhật gói chụp ảnh thành công"
      );
    },
    onError: (error) => {
      console.error("Error updating booking status:", error);
      notificationApi("error", "Cập nhật thất bại", "Vui lòng thử lại!");
    },
  });
  const closeReport = useMutation({
    mutationFn: ({ reportId, updateBody }) =>
      ManagerReportApi.closeReport(reportId, updateBody),
    onSuccess: () => {
      tableRef();
      onClose();
    },
  });
  const { mutateAsync: closeReportMutateAsync, isPending: isReportPending } =
    closeReport;
  const { mutateAsync: updateBookingPackageStatusMutateAsync, isPending } =
    updateBookingPackageStatus;
  const handleCloseReport = async () => {
    try {
      await closeReportMutateAsync({
        reportId: selectedData.id,
        updateBody: {
          content: "Đã xử lý báo cáo",
          reportStatus: "CLOSED",
          reportType: selectedData.reportType,
          referenceId: selectedData.referenceId,
        },
      });
    } catch (error) {
      console.error("Error closing report:", error);
    }
  };
  const handleBookingFailed = async () => {
    try {
      await updateBookingPackageStatusMutateAsync({
        bookingId: selectedData.referenceId,
        status: "FAILED",
      });
      handleCloseReport();
    } catch (error) {
      console.error("Error closing report:", error);
    }
  };
  const handleBookingClose = async () => {
    try {
      await updateBookingPackageStatusMutateAsync({
        bookingId: selectedData.referenceId,
        status: "SUCCESSED",
      });
      handleCloseReport();
    } catch (error) {
      console.error("Error closing report:", error);
    }
  };

  return (
    <div className=" text-gray-800 p-6 flex flex-col gap-3  max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 flex items-center">
        <Flag className="mr-2 text-red-500" />
        {selectedData.reportType === "BOOKING_PHOTOGRAPHER_REPORT_USER"
          ? "Báo cáo của nhiếp ảnh gia cho khách"
          : "Báo cáo của khách cho nhiếp ảnh gia"}
      </h2>

      <div className="space-y-6">
        {/* Report ID and Type */}
        <div className="flex justify-between items-center bg-gray-100 p-4 rounded-lg">
          <span className="text-lg font-semibold">
            ID báo cáo: {selectedData.id}
          </span>
          <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm">
            Báo cáo gói chụp
          </span>
        </div>

        {/* Reported User and Date */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gray-100 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <User className="mr-2 text-gray-600" />
              <span className="font-semibold">Người báo cáo</span>
            </div>
            <div className=" flex gap-4 items-center">
              <img
                className="w-9 h-9 rounded-full object-cover bg-[#eee]"
                src={selectedData?.user?.avatar}
                alt={selectedData?.user?.avatar}
              />
              <div className="flex flex-col">
                <p>{selectedData?.user?.name}</p>
                <p className="text-gray-500">
                  {selectedData.reportType ===
                  "BOOKING_PHOTOGRAPHER_REPORT_USER"
                    ? "Nhiếp ảnh gia"
                    : "Khách hàng"}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-gray-100 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <Calendar className="mr-2 text-gray-600" />
              <span className="font-semibold">Thời gian báo cáo</span>
            </div>
            <span>
              <ComDateConverter time>
                {selectedData?.createdAt}
              </ComDateConverter>
            </span>
            {/* <div className="flex items-center mt-2">
              <Clock className="mr-2 text-gray-600" />
              <span>{reportDetails.reportedTime}</span>
            </div> */}
          </div>

          {/* Report Status */}
          <div className="bg-gray-100 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">Trạng thái báo cáo </h3>
            <div className="flex items-center">
              {selectedData.reportStatus === "OPEN" && (
                <>
                  <Clock className="mr-2 text-yellow-500" /> Chưa phản hồi
                </>
              )}
              {selectedData.reportStatus === "CLOSED" && (
                <>
                  <CheckCircle className="mr-2 text-green-500" /> Đóng
                </>
              )}
              {selectedData.reportStatus === "actioned" && (
                <>
                  <XCircle className="mr-2 text-red-500" /> Action Taken
                </>
              )}
            </div>
          </div>
        </div>
        {/* Reported Content and Image */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-100 p-4 rounded-lg">
            {/* <h3 className="text-lg font-semibold mb-3">Nội dung báo cáo</h3> */}
            <div className="mb-3">
              <>
                <p className="font-semibold">Gói chụp</p>
                <p className=" text-right">
                  {statusRender(bookingDetail?.status)}
                </p>

                <div className=" flex gap-4 items-center mb-3">
                  <img
                    className="w-9 h-9 rounded-full object-cover bg-[#eee]"
                    src={photoshootPackageHistory?.thumbnail}
                    alt={photoshootPackageHistory?.thumbnail}
                  />
                  <div className="flex flex-col">
                    <p className="text-lg font-semibold">
                      {photoshootPackageHistory?.title}
                    </p>
                    {/* <p className="text-sm text-gray-700 font-light">
                      {user?.name}
                    </p> */}
                  </div>
                </div>
              </>
            </div>
            <p className="text-lg font-semibold ">
              {photoshootPackageHistory?.price.toLocaleString()} vnd
            </p>
            <p className="text-gray-700 bg-[#eee] p-2 rounded border border-gray-200">
              {photoshootPackageHistory?.subtitle}
            </p>
          </div>
          {selectedData.reportType === "BOOKING_PHOTOGRAPHER_REPORT_USER" ? (
            <div className="bg-gray-100 p-4 rounded-lg">
              {/* <h3 className="text-lg font-semibold mb-3">Nội dung báo cáo</h3> */}
              <div className="mb-4">
                <>
                  <p className="font-semibold mb-4">Người bị báo cáo</p>
                  <div className=" flex gap-4 items-center mb-4">
                    <img
                      className="w-9 h-9 rounded-full object-cover bg-[#eee]"
                      src={user?.avatar}
                      alt={user?.avatar}
                    />

                    <div className="flex flex-col">
                      <p>{user?.name}</p>

                      <p className="text-gray-500">
                        {selectedData.reportType ===
                        "BOOKING_PHOTOGRAPHER_REPORT_USER"
                          ? "Khách hàng"
                          : "Nhiếp ảnh gia"}
                      </p>
                    </div>
                  </div>
                </>
              </div>
              <p className="text-lg font-normal">Nội dung báo cáo:</p>
              <p className="text-gray-700 bg-white p-3 rounded border border-gray-200">
                {selectedData.content}
              </p>
            </div>
          ) : (
            <div className="bg-gray-100 p-4 rounded-lg">
              {/* <h3 className="text-lg font-semibold mb-3">Nội dung báo cáo</h3> */}
              <div className="mb-4">
                <>
                  <p className="font-semibold mb-4">Người bị báo cáo</p>
                  <div className=" flex gap-4 items-center mb-4">
                    <img
                      className="w-9 h-9 rounded-full object-cover bg-[#eee]"
                      src={originalPhotoshootPackage?.user?.avatar}
                      alt={originalPhotoshootPackage?.user?.avatar}
                    />
                    <div className="flex flex-col">
                      <p>{originalPhotoshootPackage?.user?.name}</p>
                      <p className="text-gray-500">
                        {selectedData.reportType ===
                        "BOOKING_PHOTOGRAPHER_REPORT_USER"
                          ? "Nhiếp ảnh gia"
                          : "Khách hàng"}
                      </p>
                    </div>
                  </div>
                </>
              </div>
              <p className="text-lg font-normal">Nội dung báo cáo:</p>
              <p className="text-gray-700 bg-white p-3 rounded border border-gray-200">
                {selectedData.content}
              </p>
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-col border bg-[#f3f4f6]  rounded-lg overflow-y-auto">
        <div className="bg-[#f3f4f6] border-b border-gray-300 p-4 rounded-t-lg flex items-center justify-center font-bold text-xl">
          Hóa đơn
        </div>
        {billItems?.map((item, index) => (
          <div
            key={item?.id} // Thêm `key` để tránh cảnh báo React
            className={`flex flex-col gap-2 p-3 ${
              index !== billItems.length - 1 ? "border-b border-gray-300" : ""
            }`}
          >
            <div className="flex items-center justify-between ">
              <div className="items-center text-gray-500">
                Tiêu đề:{" "}
                <span className="text-[#202225] font-bold"> {item?.title}</span>
              </div>
              <div>
                {item?.type === "INCREASE" ? (
                  <div className="text-green-500">
                    +{item?.price.toLocaleString()} VND
                  </div>
                ) : (
                  <div className="text-red-500">
                    -{item?.price.toLocaleString()} VND
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        <div className=" px-3">
          <div className="flex items-center justify-between border-t border-gray-300 py-3">
            <div className="text-gray-500 font-bold">Tổng cộng: </div>
            <div className="flex items-center text-xl font-bold ">
              {totalBillItem?.toLocaleString()} VND
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold">Danh sách ảnh</h3>
        {!photos ||
          (!photos.length > 0 && (
            <div className="m-3 text-gray-600">Chưa có ảnh trong gói chụp</div>
          ))}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
            gap: "16px",
            marginTop: "16px",
          }}
        >
          {photos &&
            photos.length > 0 &&
            photos.map((photo, index) => (
              <div
                key={index}
                style={{
                  width: "100%",
                  height: "120px",
                  backgroundImage: `url(${photo.signedUrl.url})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  borderRadius: "8px",
                  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                }}
              />
            ))}
        </div>
      </div>
      {selectedData.reportStatus === "OPEN" && (
        <div
          className={`grid ${
            selectedData.reportType === "BOOKING_PHOTOGRAPHER_REPORT_USER"
              ? "grid-cols-2"
              : "grid-cols-3"
          } `}
        >
          <div className="flex text-center justify-center">
            <Popconfirm
              title="Bạn có chắc chắn muốn đóng báo cáo này không?"
              onConfirm={() => handleCloseReport()}
              disabled={isPending || isReportPending}
            >
              <p
                className={`${
                  isPending || isReportPending
                    ? "bg-gray-500 cursor-not-allowed"
                    : "bg-gray-700 cursor-pointer"
                } py-2 px-16 rounded-lg  text-white hover:opacity-80`}
              >
                Đóng báo cáo
              </p>
            </Popconfirm>
          </div>
          <div className="flex text-center justify-center">
            <Popconfirm
              title="Bạn có chắc chắn muốn hủy gói chụp này không?"
              onConfirm={() => handleBookingFailed()}
              disabled={isPending || isReportPending}
            >
              <p
                className={`${
                  isPending || isReportPending
                    ? "bg-gray-500 cursor-not-allowed"
                    : "bg-red-500 cursor-pointer"
                } py-2 px-16 rounded-lg  text-white hover:opacity-80`}
              >
                Hủy gói
              </p>
            </Popconfirm>
          </div>
          {selectedData.reportType === "BOOKING" && (
            <div className="flex text-center justify-center">
              <Popconfirm
                title="Bạn có chắc chắn muốn kết thúc gói chụp này không?"
                onConfirm={() => handleBookingClose()}
                disabled={isPending || isReportPending}
              >
                <p
                  className={`${
                    isPending || isReportPending
                      ? "bg-gray-500 cursor-not-allowed"
                      : "bg-green-500 cursor-pointer"
                  } py-2 px-16 rounded-lg  text-white hover:opacity-80`}
                >
                  Kết thúc gói
                </p>
              </Popconfirm>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

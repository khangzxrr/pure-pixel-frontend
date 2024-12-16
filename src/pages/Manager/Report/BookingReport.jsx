import { useQuery } from "@tanstack/react-query";
import React from "react";
import ManagerReportApi from "../../../apis/ManagerReportApi";
import { Modal, Descriptions, Avatar, Divider, List } from "antd";

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

export default function BookingReport({ selectedData, tableRef, onClose }) {
  const { data: bookingDetail, isPending } = useQuery({
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
  console.log("bookingDetail", bookingDetail);
  console.log("selectedData", selectedData);
  return (
    <div className=" text-gray-800 p-6   max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 flex items-center">
        <Flag className="mr-2 text-red-500" />
        Chi tiết báo cáo
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
              <span>{selectedData?.user?.name}</span>
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
                <p className="font-semibold mb-4">Gói chụp</p>
                <div className=" flex gap-4 items-center mb-4">
                  <img
                    className="w-9 h-9 rounded-full object-cover bg-[#eee]"
                    src={photoshootPackageHistory?.thumbnail}
                    alt={photoshootPackageHistory?.thumbnail}
                  />
                  <p className="text-lg font-semibold ">
                    {photoshootPackageHistory?.title}
                  </p>
                </div>
              </>
            </div>
            <p className="text-lg font-semibold ">
              {photoshootPackageHistory?.price.toLocaleString()} vnd
            </p>
            <p className="text-gray-700 bg-white p-2 rounded border border-gray-200">
              {photoshootPackageHistory?.subtitle}
            </p>
          </div>
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
                  <span>{originalPhotoshootPackage?.user?.name}</span>
                </div>
              </>
            </div>
            <p className="text-lg font-normal">Nội dung báo cáo:</p>
            <p className="text-gray-700 bg-white p-3 rounded border border-gray-200">
              {selectedData.content}
            </p>
          </div>
        </div>
      </div>
      <List
        header={<strong>Các mục trong hóa đơn</strong>}
        bordered
        dataSource={billItems}
        renderItem={(item) => (
          <List.Item>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Tiêu đề">
                {item?.title}
              </Descriptions.Item>
              <Descriptions.Item label="Loại">
                {item?.type === "INCREASE" ? "Tăng" : "Giảm"}
              </Descriptions.Item>
              <Descriptions.Item label="Giá">
                {item?.price.toLocaleString()} VND
              </Descriptions.Item>
            </Descriptions>
          </List.Item>
        )}
      />
      <div>
        <h3 className="text-lg font-semibold">Danh sách ảnh</h3>
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
    </div>
  );
}

import React from "react";
import { Image } from "antd";
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
import ComButton from "../../../components/ComButton/ComButton";
import { patchData, postData } from "../../../apis/api";
import { useNotification } from "../../../Notification/Notification";
const reportDetails = {
  id: "REP12345",
  type: "content",
  reportedUser: "johndoe",
  reportedDate: "2023-05-15",
  reportedTime: "14:30",
  content:
    "This is the reported content that violates community guidelines. It contains inappropriate language and misleading information that could harm our community members.",
  imageUrl:
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-Hfz6ty7NWs5SN8YKpxVs3TVkffbzeG.png",
  views: 1250,
  reports: 15,
  comments: 8,
  status: "pending",
  reasons: ["Hate speech", "Misinformation", "Harassment"],
};
export default function DetailReport({ selected, tableRef, onClose }) {
  const { notificationApi } = useNotification();

  console.log("====================================");
  console.log(selected);
  console.log("====================================");

  const banUser = () => {
    postData(`/user/${selected?.referencedUser?.id}/ban`)
      .then((data) => {
        console.log(data);
        patchData(`manager/report`, `${selected.id}`, {
          reportStatus: "CLOSED",
        })
          .then((e) => {
            console.log("11111", e);
            notificationApi("success", "Thành công", "Đã đóng báo cáo");
            tableRef();
            onClose();
          })
          .catch((error) => {
            notificationApi("error", "Không thành công", "Lỗi");
            console.log("error", error);
          });
      })
      .catch((error) => {
        notificationApi("error", "Không thành công", "Lỗi khóa tài khoản");

        console.log(error);
      });
  };

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
            ID báo cáo: {reportDetails.id}
          </span>
          <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm">
            {selected?.reportType === "PHOTO"
              ? "Báo cáo hình ảnh"
              : "Báo cáo người dùng"}
          </span>
        </div>

        {/* Reported User and Date */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-100 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <User className="mr-2 text-gray-600" />
              <span className="font-semibold">Người dùng báo cáo</span>
            </div>
            <div className=" flex gap-4">
              <div className="w-20 h-20 flex items-center justify-center overflow-hidden">
                <Image
                  wrapperClassName=" w-20 h-20 object-cover object-center flex items-center justify-center "
                  src={selected?.user?.avatar}
                  alt={selected?.user?.avatar}
                  preview={{ mask: "Xem ảnh" }}
                />
              </div>
              <span>{selected?.user?.name}</span>
            </div>
          </div>
          <div className="bg-gray-100 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <Calendar className="mr-2 text-gray-600" />
              <span className="font-semibold">Thời gian báo cáo</span>
            </div>
            <span>
              <ComDateConverter time>{selected?.createdAt}</ComDateConverter>
            </span>
            {/* <div className="flex items-center mt-2">
              <Clock className="mr-2 text-gray-600" />
              <span>{reportDetails.reportedTime}</span>
            </div> */}
          </div>
        </div>

        {/* Reported Content and Image */}
        <div className="bg-gray-100 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">Nội dung báo cáo</h3>
          <div className="mb-4">
            {selected?.reportType === "PHOTO" && (
              <>
                <>
                  <div className="relative w-full h-48">
                    <Image
                      className="object-cover w-full h-full"
                      src={selected?.referencedPhoto?.photographer?.cover} // Nếu không có cover, dùng ảnh mặc định
                      alt="Cover Image"
                      layout="fill"
                    />
                  </div>

                  {/* Ảnh đại diện */}
                  <div className="absolute  ">
                    <img
                      wrapperClassName="w-32 max-h-32 object-cover rounded-full border-4 border-white"
                      className="w-32 h-32 object-cover rounded-full border-4 border-white"
                      src={selected?.referencedPhoto?.photographer?.avatar} // Nếu không có avatar, dùng ảnh mặc định
                      alt={selected?.referencedPhoto?.photographer?.name}
                      preview={{ mask: "Xem ảnh" }}
                    />
                  </div>
                </>
                <div className="mt-36 p-4">
                  <p className="text-2xl font-semibold">
                    {selected?.referencedPhoto?.photographer?.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {selected?.referencedPhoto?.photographer?.quote}
                  </p>
                </div>

                <p className="p-4 font-semibold">
                  Tên bài viết :{selected?.referencedPhoto?.title}
                </p>
                <img
                  src={selected?.referencedPhoto?.signedUrl?.url}
                  alt="Reported post image"
                  className="w-full h-auto rounded-lg mb-2"
                />
              </>
            )}
            {selected?.reportType === "USER" && (
              <>
                {/* Ảnh cover */}
                <div className="relative w-full h-48">
                  <Image
                    className="object-cover w-full h-full"
                    src={selected?.referencedUser?.cover} // Nếu không có cover, dùng ảnh mặc định
                    alt="Cover Image"
                    layout="fill"
                  />
                </div>

                {/* Ảnh đại diện */}
                <div className="absolute ">
                  <Image
                    wrapperClassName="w-32 h-32 object-cover rounded-full border-4 border-white"
                    src={selected?.referencedUser?.avatar} // Nếu không có avatar, dùng ảnh mặc định
                    alt={selected?.referencedUser?.name}
                    preview={{ mask: "Xem ảnh" }}
                  />
                </div>

                {/* Thông tin người dùng */}
                <div className="mt-36 p-4">
                  <p className="text-2xl font-semibold">
                    {selected?.referencedUser?.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {selected?.referencedUser?.quote}
                  </p>
                  <div className="mt-4">
                    <p>Email: {selected?.referencedUser?.mail}</p>
                    <p>
                      Số điện thoại: {selected?.referencedUser?.phonenumber}
                    </p>
                    <p>Địa chỉ: {selected?.referencedUser?.location}</p>
                  </div>
                </div>
              </>
            )}
          </div>
          <p className="text-2xl font-normal">Nội dung báo cáo:</p>
          <p className="text-gray-700 bg-white p-3 rounded border border-gray-200">
            {selected.content}
          </p>
        </div>

        {/* Report Status */}
        <div className="bg-gray-100 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">Trạng thái báo cáo </h3>
          <div className="flex items-center">
            {selected.reportStatus === "OPEN" && (
              <>
                <Clock className="mr-2 text-yellow-500" /> Chưa phản hồi
              </>
            )}
            {selected.reportStatus === "CLOSED" && (
              <>
                <CheckCircle className="mr-2 text-green-500" /> Đóng
              </>
            )}
            {selected.reportStatus === "actioned" && (
              <>
                <XCircle className="mr-2 text-red-500" /> Action Taken
              </>
            )}
          </div>
        </div>
        <div className="flex m-1 gap-3">
          {selected.reportStatus === "OPEN" ? (
            <>
              {selected?.reportType === "PHOTO" ? (
                <ComButton
                  onClick={() => {
                    // update("ComPleted");
                  }}
                >
                  Hình ảnh hợp lệ
                </ComButton>
              ) : (
                <ComButton
                  onClick={() => {
                    // update("ComPleted");
                  }}
                >
                  Tài khoản hợp lệ
                </ComButton>
              )}

              {selected?.reportType === "PHOTO" ? (
                <ComButton
                  className={" bg-red-600 "}
                  onClick={() => {
                    // update("ComPleted");
                  }}
                >
                  Khóa bài viết
                </ComButton>
              ) : (
                <ComButton
                  className={" bg-red-600 "}
                  onClick={() => {
                    banUser();
                  }}
                >
                  Khóa tài khoản
                </ComButton>
              )}
            </>
          ) : (
            <></>
          )}
        </div>
      </div>
    </div>
  );
}

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

export default function DetailReport({ selected, tableRef, onClose }) {
  const { notificationApi } = useNotification();

  // console.log("====================================");
  // console.log(selected);
  // console.log("====================================");

  const closeReport = () => {
    patchData(`manager/report`, `${selected.id}`, {
      reportStatus: "CLOSED",
    })
      .then((e) => {
        // console.log("11111", e);
        notificationApi("success", "Thành công", "Đã đóng báo cáo");
        tableRef();
        onClose();
      })
      .catch((error) => {
        notificationApi("error", "Không thành công", "Lỗi");
        console.log("error", error);
      });
  };
  const banPhoto = () => {
    postData(`/manager/photo/${selected?.referencedPhoto?.id}/ban`)
      .then((data) => {
        // console.log(data);
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
        notificationApi("error", "Không thành công", "Lỗi khóa hình ảnh");

        console.log(error);
      });
  };
  const banUser = () => {
    postData(`/user/${selected?.referencedUser?.id}/ban`)
      .then((data) => {
        // console.log(data);
        patchData(`manager/report`, `${selected.id}`, {
          reportStatus: "CLOSED",
        })
          .then((e) => {
            // console.log("11111", e);
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
            ID báo cáo: {selected.id}
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
              <span className="font-semibold">Người báo cáo</span>
            </div>
            <div className=" flex gap-4 items-center">
              <img
                className="w-9 h-9 rounded-full object-cover bg-[#eee]"
                src={selected?.user?.avatar}
                alt={selected?.user?.avatar}
              />
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
        {/* Reported Content and Image */}
        <div className="bg-gray-100 p-4 rounded-lg">
          {/* <h3 className="text-lg font-semibold mb-3">Nội dung báo cáo</h3> */}
          <div className="mb-4">
            {selected?.reportType === "PHOTO" && (
              <>
                <p className="font-semibold mb-4">Chủ sở hữu</p>
                <div className=" flex gap-4 items-center mb-4">
                  <img
                    className="w-9 h-9 rounded-full object-cover bg-[#eee]"
                    src={selected?.referencedPhoto?.photographer?.avatar}
                    alt={selected?.referencedPhoto?.photographer?.avatar}
                  />
                  <span>{selected?.referencedPhoto?.photographer?.name}</span>
                </div>
                <p className=" mb-4 font-semibold">
                  Tên ảnh: {selected?.referencedPhoto?.title}
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
                <p className=" mb-4 font-semibold">Người bị báo cáo</p>

                {/* Thông tin người dùng */}
                <div className=" flex gap-4 items-center mb-4">
                  <img
                    className="w-9 h-9 rounded-full object-cover bg-[#eee]"
                    src={selected?.referencedUser?.avatar}
                    alt={selected?.referencedUser?.avatar}
                  />
                  <span>{selected?.referencedUser?.name}</span>
                </div>
                <p className="text-sm text-gray-600">
                  {selected?.referencedUser?.quote}
                </p>
                <div className="mt-4">
                  <p>Email: {selected?.referencedUser?.mail}</p>
                  <p>Số điện thoại: {selected?.referencedUser?.phonenumber}</p>
                  <p>Địa chỉ: {selected?.referencedUser?.location}</p>
                </div>
              </>
            )}
          </div>
          <p className="text-2xl font-normal">Nội dung báo cáo:</p>
          <p className="text-gray-700 bg-white p-3 rounded border border-gray-200">
            {selected.content}
          </p>
        </div>

        <div className="flex m-1 gap-3">
          {selected.reportStatus === "OPEN" ? (
            <>
              {selected?.reportType === "PHOTO" ? (
                <ComButton
                  onClick={() => {
                    closeReport();
                  }}
                >
                  Hình ảnh hợp lệ
                </ComButton>
              ) : (
                <ComButton
                  onClick={() => {
                    closeReport();
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
                    banPhoto();
                    notificationApi("error", "Không thành công", "Chưa có api");
                  }}
                >
                  Khóa hình ảnh
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

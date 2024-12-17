import React, { useState } from "react";
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
import { Popconfirm, Upload } from "antd";
import PhotoService from "../../../services/PhotoService";
import { UploadOutlined } from "@ant-design/icons";
import { useMutation } from "@tanstack/react-query";
import ManageTracsaction from "../../../apis/ManageTransaction";
export default function WithdrawalProcessingModal({
  selectedData,
  tableRef,
  onClose,
}) {
  const [evidencePhoto, setEvidencePhoto] = useState(""); //evidence to proof that the system have been make transfer for withdrawal
  const [evidencePhotoUrl, setEvidencePhotoUrl] = useState("");
  console.log(selectedData);
  const acceptWithdrawal = useMutation({
    mutationFn: ({ transactionId, photo }) =>
      ManageTracsaction.acceptWithdrawal(transactionId, photo),
  });
  const {
    mutateAsync: acceptWithdrawalMutate,
    isPending: isAcceptWithdrawalPending,
  } = acceptWithdrawal;
  const onEvidencePhotoChange = async (info) => {
    const newFile = info.file.originFileObj;

    try {
      // Get the cropped image from the info object
      // Convert the cropped image to a URL for preview
      const reviewUrl = await PhotoService.convertArrayBufferToObjectUrl(
        newFile
      );

      // Update states with the cropped image
      setEvidencePhoto(newFile);
      setEvidencePhotoUrl(reviewUrl);
    } catch (error) {
      console.log(error);
    }
  };
  const handleWithDrawal = async () => {
    console.log(selectedData.id, evidencePhoto);
    try {
      await acceptWithdrawalMutate({
        transactionId: selectedData.id,
        photo: evidencePhoto,
      });
      // Optionally, you can call tableRef or onClose here if needed
      tableRef();
      onClose();
    } catch (error) {
      console.error("Error during withdrawal:", error);
    }
  };
  return (
    <div className=" text-gray-800 p-6   max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 flex items-center">
        <Flag className="mr-2 text-red-500" />
        Xử lý rút tiền
      </h2>

      <div className="space-y-6">
        {/* Report ID and Type */}
        <div className="flex justify-between items-center bg-gray-100 p-4 rounded-lg">
          <span className="text-lg font-semibold">
            ID rút tiền: {selectedData.id}
          </span>
          <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm">
            Rút tiền
          </span>
        </div>

        {/* Reported User and Date */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gray-100 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <User className="mr-2 text-gray-600" />
              <span className="font-semibold">Người rút tiền</span>
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
              <span className="font-semibold">Số tiền người dùng hiện tại</span>
            </div>
            <div className=" flex mt-5 items-center text-base font-semibold">
              <span>
                {selectedData?.wallet?.walletBalance.toLocaleString()}đ
              </span>
            </div>
          </div>
          <div className="bg-gray-100 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <Calendar className="mr-2 text-gray-600" />
              <span className="font-semibold">Thời gian yêu cầu rút tiền</span>
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
        </div>
        {/* Report Status */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-100 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">Thông tin rút tiền </h3>
            <div className="text-base flex flex-col gap-2  mb-4">
              <p>{selectedData?.withdrawalTransaction?.bankName}</p>
              <p>{selectedData?.withdrawalTransaction?.bankUsername}</p>
              <p>{selectedData?.withdrawalTransaction?.bankNumber}</p>
            </div>
            <p className="text-base font-semibold text-gray-600">
              Số tiền: {selectedData.amount.toLocaleString()}đ
            </p>
          </div>
          <div className="bg-gray-100 p-4 rounded-lg">
            <Upload
              accept=".jpg,.jpeg,.png,.gif,.webp"
              name="showcases"
              showUploadList={false}
              onChange={onEvidencePhotoChange}
            >
              {!evidencePhotoUrl ? (
                <div className=" my-auto py-6 flex flex-col items-center justify-center hover:opacity-80 bg-transparent cursor-pointer">
                  <UploadOutlined className="text-4xl text-gray-600" />
                  <p className="text-gray-600 text-xl text-center">
                    Tải minh chứng cho việc đã chuyển khoản thành công
                  </p>
                </div>
              ) : (
                <div className="w-full overflow-hidden flex my-auto">
                  <img
                    src={evidencePhotoUrl}
                    className="w-full object-cover"
                    alt="Thumbnail"
                  />
                </div>
              )}
            </Upload>
          </div>
        </div>
        <div className="flex justify-end">
          <Popconfirm
            title="Bạn có chắc chắn muốn xác nhận chuyển tiền cho người dùng này?"
            onConfirm={() => {
              handleWithDrawal();
            }}
            disabled={!evidencePhoto || isAcceptWithdrawalPending}
          >
            <button
              className={`${
                evidencePhoto && !isAcceptWithdrawalPending
                  ? "bg-green-500 cursor-pointer hover:opacity-80"
                  : "bg-gray-500 cursor-not-allowed"
              } px-2 py-1  text-white text-lg  rounded-md`}
              disable={!evidencePhoto || isAcceptWithdrawalPending}
            >
              Xác nhận chuyển tiền
            </button>
          </Popconfirm>
        </div>
      </div>
    </div>
  );
}

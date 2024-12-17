import React, { useState } from "react";
import { Flag, User, Calendar } from "lucide-react";
import ComDateConverter from "../../../components/ComDateConverter/ComDateConverter";
import { Popconfirm, Upload } from "antd";
import PhotoService from "../../../services/PhotoService";
import { UploadOutlined } from "@ant-design/icons";
import { useMutation } from "@tanstack/react-query";
import ManageTracsaction from "../../../apis/ManageTransaction";
import { IoMdArrowRoundBack } from "react-icons/io";

const cancelReasons = [
  { value: "Số tiền không hợp lệ" },
  { value: "Nội dung bất hợp pháp" },
  { value: "Tài khoản giả mạo" },
  { value: "Khác" },
];
export default function WithdrawalProcessingModal({
  selectedData,
  tableRef,
  onClose,
}) {
  const [isDeny, setIsDeny] = useState(false);
  const [detailReason, setDetailReason] = useState("");
  const [reason, setReason] = useState("");
  const [evidencePhoto, setEvidencePhoto] = useState(""); //evidence to proof that the system have been make transfer for withdrawal
  const [evidencePhotoUrl, setEvidencePhotoUrl] = useState("");
  // console.log(selectedData);
  const acceptWithdrawal = useMutation({
    mutationFn: ({ transactionId, photo }) =>
      ManageTracsaction.acceptWithdrawal(transactionId, photo),
  });
  const {
    mutateAsync: acceptWithdrawalMutate,
    isPending: isAcceptWithdrawalPending,
  } = acceptWithdrawal;
  const denyWithdrawal = useMutation({
    mutationFn: ({ transactionId, failReason }) =>
      ManageTracsaction.denyWithdrawal(transactionId, failReason),
    onSuccess: () => {
      tableRef();
      onClose();
    },
  });
  const {
    mutateAsync: denyWithdrawalMutate,
    isPending: isDenyWithdrawalPending,
  } = denyWithdrawal;
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
    // console.log(selectedData.id, evidencePhoto);
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
  const cancelWithDrawal = async () => {
    console.log(
      selectedData.id,
      reason + (detailReason ? `: ${detailReason}` : "")
    );
    try {
      await denyWithdrawalMutate({
        transactionId: selectedData.id,
        failReason: reason + (detailReason ? `: ${detailReason}` : ""),
      });
      // Optionally, you can call tableRef or onClose here if needed
      tableRef();
      onClose();
    } catch (error) {
      console.error("Error during withdrawal denial:", error);
    }
  };
  return (
    <div className=" text-gray-800 p-6   max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 flex items-center">
        <Flag className="mr-2 text-red-500" />
        Xử lý rút tiền
      </h2>
      {!isDeny ? (
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
                <span className="font-semibold">
                  Số tiền còn lại sau khi rút
                </span>
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
                <span className="font-semibold">
                  Thời gian yêu cầu rút tiền
                </span>
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
              <h3 className="text-lg font-semibold mb-3">
                Thông tin rút tiền{" "}
              </h3>
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
          <div className="flex justify-end gap-3">
            <button
              className={`${
                !isAcceptWithdrawalPending
                  ? "bg-red-500 cursor-pointer hover:opacity-80"
                  : "bg-gray-500 cursor-not-allowed"
              } px-2 py-1  text-white  rounded-md`}
              onClick={() => {
                setIsDeny(true);
              }}
            >
              Hủy yêu cầu rút tiền
            </button>
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
                } px-2 py-1  text-white  rounded-md`}
                disable={!evidencePhoto || isAcceptWithdrawalPending}
              >
                Xác nhận chuyển tiền
              </button>
            </Popconfirm>
          </div>
        </div>
      ) : (
        <div className="space-y-6 overflow-y-auto custom-scrollbar">
          <div className="space-y-4">
            <IoMdArrowRoundBack
              className="hover:opacity-85 cursor-pointer text-xl text-[#3a3a3a] hover:bg-gray-300 rounded-full"
              onClick={() => setIsDeny(false)}
            />

            <h3 className="text-lg font-semibold text-gray-800">
              Lý do hủy yêu cầu rút tiền
            </h3>
            <p className="text-sm text-gray-600">
              Chọn lý do tại sao bạn lại hủy yêu cầu rút
            </p>
            <div className="grid grid-cols-2 gap-4">
              {cancelReasons.map((item) => (
                <label
                  key={item.value}
                  className={`flex items-center space-x-2 rounded-lg border p-4 cursor-pointer transition-colors ${
                    reason === item.value
                      ? "border-blue-500 bg-blue-100"
                      : "border-gray-300 hover:bg-gray-100"
                  }`}
                >
                  <input
                    type="radio"
                    name="report-reason"
                    value={item.value}
                    checked={reason === item.value}
                    onChange={(e) => setReason(e.target.value)}
                    className="sr-only"
                    required
                  />
                  <div
                    className={`w-4 h-4 border-2 rounded-full ${
                      reason === item.value
                        ? "border-blue-500 bg-blue-500"
                        : "border-gray-400"
                    }`}
                  />
                  <span className="text-gray-800">{item.value}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Chi tiết lý do hủy rút tiền
            </h3>
            <textarea
              value={detailReason}
              onChange={(e) => setDetailReason(e.target.value)}
              className="w-full min-h-[100px] bg-white border border-gray-300 rounded-md p-2 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Nhập thông tin cung cấp thêm tại đây"
            />
          </div>
          <button
            className={`w-full py-2 rounded-md transition-colors ${
              reason && !isDenyWithdrawalPending
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
            disabled={!reason || isDenyWithdrawalPending}
            onClick={() => cancelWithDrawal()}
          >
            Gửi báo cáo
          </button>
        </div>
      )}
    </div>
  );
}

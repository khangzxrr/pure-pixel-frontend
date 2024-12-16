import React, { useState } from "react";
import { Modal, Button, Radio, Input, ConfigProvider } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useMutation } from "@tanstack/react-query";
import UserApi from "../../apis/UserApi";
import { useNotification } from "../../Notification/Notification";

const reportReasons = [
  { value: "Vi phạm bản quyền", label: "Vi phạm bản quyền" },
  { value: "Nội dung bất hợp pháp", label: "Nội dung bất hợp pháp" },
  { value: "Tài khoản giả mạo", label: "Tài khoản giả mạo" },
  { value: "Thiếu trách nhiệm", label: "Thiếu trách nhiệm" },
  { value: "Chưa xử lý", label: "Chưa xử lý" },
  { value: "Khác", label: "Khác" },
];

export default function ReportBookingModal({
  visible,
  onClose,
  id,
  reportType,
}) {
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const { notificationApi } = useNotification();

  const reportByUser = useMutation({
    mutationFn: ({ content, reportType, referenceId }) =>
      UserApi.reportByUser({
        content,
        reportType,
        referenceId,
      }),
    onSuccess: () => {
      notificationApi(
        "success",
        "Báo cáo gói chụp này thành công",
        "Chúng tôi sẽ xem xét và xử lý nhanh nhất có thể."
      );
      setReason("");
      setDetails("");
      onClose();
    },
    onError() {
      notificationApi(
        "error",
        "Báo cáo gói chụp thất bại",
        "Có vẻ có gì đó không đúng, vui lòng thử lại sau."
      );
    },
  });
  const { mutate: reportByUserMutate, isPending: isPendingReport } =
    reportByUser;
  const handleSubmit = () => {
    // console.log("reportType", reason, details, reportType, id);
    reportByUserMutate({
      content: reason + (details ? `: ${details}` : ""),
      reportType,
      referenceId: id,
    });
  };

  return (
    <ConfigProvider
      theme={{
        components: {
          Modal: {
            contentBg: "#2f3136",
            headerBg: "#2f3136",
            titleColor: "white",
          },
        },
      }}
    >
      <Modal
        title="Cảnh báo"
        open={visible && id}
        onCancel={onClose}
        className="custom-close-icon"
        width={600}
        centered={true}
        footer={null}
      >
        <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-100">
              Chuyện gì đang xảy ra vậy
            </h3>
            <p className="text-sm text-gray-400">
              Chọn lý do tại sao bạn báo cáo nó.
            </p>
            <div className="grid grid-cols-2 gap-4">
              {reportReasons.map((item) => (
                <label
                  key={item.value}
                  className={`flex items-center space-x-2 rounded-lg border p-4 cursor-pointer transition-colors ${
                    reason === item.value
                      ? "border-blue-500 bg-blue-500 bg-opacity-10"
                      : "border-gray-700 hover:bg-gray-700/50"
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
                        : "border-gray-500"
                    }`}
                  />
                  <span className="text-gray-100">{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-100">
              Hãy cho chúng tôi biết thêm.
            </h3>
            <p className="text-sm text-gray-400">
              Vui lòng cung cấp thêm chi tiết nếu có thể để giúp chúng tôi xử lý
              vấn đề nhanh hơn.
            </p>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="w-full min-h-[100px] bg-gray-700 border border-gray-600 rounded-md p-2 text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Nhập tin nhắn của bạn ở đây."
            />
          </div>

          <button
            className={`w-full py-2 rounded-md transition-colors ${
              reason
                ? "bg-gray-50 text-gray-900 hover:bg-gray-300"
                : "bg-gray-600 text-gray-400 cursor-not-allowed"
            }`}
            disabled={!reason}
            onClick={() => handleSubmit()}
          >
            Gửi báo cáo
          </button>
        </div>
      </Modal>
    </ConfigProvider>
  );
}

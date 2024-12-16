import React, { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { postData } from "../../apis/api";
import { message } from "antd";

const reportReasons = [
  { value: "Tự làm hại bản thân", label: "Tự làm hại bản thân" },
  { value: "Nội dung bất hợp pháp", label: "Nội dung bất hợp pháp" },
  { value: "Quấy rối hoặc bắt nạt", label: "Quấy rối hoặc bắt nạt" },
  { value: "Không đúng sự thật", label: "Không đúng sự thật" },
  { value: "spam", label: "Spam" },
  { value: "Khác", label: "Khác" },
];
// reportType =USER, PHOTO, BOOKING, COMMENT;
export default function ComReport({
  onclose,
  tile = "Báo cáo",
  id,
  reportType,
}) {
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // console.log({
    //   content: reason + details,
    //   reportStatus: "OPEN",
    //   reportType: reportType,
    //   referenceId: id,
    // });
    postData("/user/report", {
      content: reason + " " + details,
      reportType: reportType,
      referenceId: id,
    })
      .then(() => {
        onclose();
        message.success("Báo cáo thành công");
        setReason("");
        setDetails("");
      })
      .catch((error) => {
        console.log(error);

        message.error("Lỗi");
      });

    // onclose();
    // Reset form
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60] ">
      <div className="bg-[#2f3136] w-full max-w-[700px]  rounded-lg shadow-lg ">
        <div className="border-b border-gray-700 p-4 flex items-center justify-between gap-4">
          <button
            onClick={() => onclose()}
            className="text-gray-400 hover:text-gray-100 transition-colors"
            aria-label="Back"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h2 className="text-xl font-semibold text-gray-100 text-center">
            {tile}
          </h2>
          <div></div>
        </div>
        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-6 max-h-[500px] overflow-y-auto"
        >
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
            type="submit"
            className={`w-full py-2 rounded-md transition-colors ${
              reason
                ? "bg-gray-50 text-gray-900 hover:bg-gray-300"
                : "bg-gray-600 text-gray-400 cursor-not-allowed"
            }`}
            disabled={!reason}
          >
            Gửi báo cáo
          </button>
        </form>
      </div>
    </div>
  );
}

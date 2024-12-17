import { Image, Modal, Typography } from "antd";
import React from "react";
import ComDateConverter from "../../../components/ComDateConverter/ComDateConverter";
import { useNotification } from "../../../Notification/Notification";
import ComButton from "../../../components/ComButton/ComButton";
import { patchData } from "../../../apis/api";
function formatCurrency(number) {
  // Sử dụng hàm toLocaleString() để định dạng số thành chuỗi với ngăn cách hàng nghìn và mặc định là USD.
  if (typeof number === "number") {
    return number.toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
    });
  }
}
export default function DetailTransactionWithdrawal({
  selectedData,
  reloadData,
  onClose,
}) {
  console.log(selectedData);
  const { notificationApi } = useNotification();

  return (
    <div>
      <div>
        {/* Bill Details */}
        <div className="p-4 bg-white mt-4">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Chi tiết yêu cầu rút tiền
          </h2>
          <table className="w-full">
            <tbody>
              {[
                {
                  label: "Người yêu cầu:",
                  value: (
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          selectedData?.user?.avatar ||
                          "https://via.placeholder.com/40"
                        } // URL avatar, thêm ảnh mặc định nếu không có
                        alt="Avatar"
                        className="w-9 h-9 rounded-full object-cover bg-[#eee]"
                      />
                      <span>{selectedData?.user?.name}</span>
                    </div>
                  ),
                },

                {
                  label: "Thời gian yêu cầu:",
                  value: (
                    <ComDateConverter time>
                      {selectedData?.createdAt}
                    </ComDateConverter>
                  ),
                },
                {
                  label: "Số tiền:",
                  value: formatCurrency(selectedData?.amount),
                },
                {
                  label: "Ngân hàng:",
                  value: <>{selectedData?.withdrawalTransaction?.bankName}</>,
                },
                {
                  label: "Số tài khoản:",
                  value: (
                    <>
                      <p>{selectedData?.withdrawalTransaction?.bankNumber}</p>
                      <p>{selectedData?.withdrawalTransaction?.bankUsername}</p>
                    </>
                  ),
                },
                // Conditionally add this row if status === "CANCEL"
                ...(selectedData?.status === "CANCEL"
                  ? [
                      {
                        label: "Lý do hủy:",
                        value: selectedData?.withdrawalTransaction?.failReason,
                      },
                    ]
                  : []),
              ].map((item, index) => (
                <tr key={index} className="border-b">
                  <td className="px-4 py-2 text-gray-600 font-medium">
                    {item?.label}
                  </td>
                  <td className="px-4 py-2">{item?.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {selectedData.status === "SUCCESS" && (
            <div className="flex flex-col justify-center items-center border w-full rounded-lg my-2 min-h-[200px] bg-gray-500 py-3">
              {selectedData?.withdrawalTransaction?.successPhotoUrl ? (
                <div className="w-1/3 flex justify-center items-center overflow-hidden">
                  <Image
                    src={selectedData?.withdrawalTransaction?.successPhotoUrl}
                    className="w-full h-full object-contain"
                    preview={true}
                  />
                </div>
              ) : (
                <div className="text-white w-full text-center font-bold text-xl">
                  Yêu cầu này chưa có minh chứng rút tiền
                </div>
              )}
            </div>
          )}

          <div className="flex gap-10 mt-10">
            <ComButton
              className={" bg-[#505662] mx-10 w-full"}
              onClick={() => onClose()}
            >
              Đóng
            </ComButton>
          </div>
        </div>
      </div>
    </div>
  );
}

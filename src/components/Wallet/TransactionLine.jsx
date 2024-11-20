import React from "react";

export default function TransactionLine({ item }) {
  const renderAmount = (amount, type) => {
    switch (type) {
      case "DEPOSIT":
        return <p className="text-green-400">+{amount}</p>;
      case "WITHDRAWAL":
        return <p className="text-red-400">-{amount}</p>;
      default:
        return <p>{amount}</p>;
    }
  };

  const translateStatus = (status) => {
    switch (status) {
      case "PENDING":
        return <p className="text-yellow-500">◔ Đang chờ</p>;
      case "SUCCESS":
        return <p className="text-green-500">✓ Thành công</p>;
      case "CANCEL":
        return <p className="text-red-500">× Đã hủy</p>;
      case "FAILED":
        return <p className="text-gray-200">Thất bại</p>;
      default:
        return <p className="text-gray-200">Không xác định</p>;
    }
  };

  const renderMethod = (method) => {
    switch (method) {
      case "SEPAY":
        return (
          <div className="flex flex-row justify-center">
            <img
              src="https://sepay.vn/assets/img/logo/sepay-820x820-blue-icon.png"
              alt="sepay"
              className="w-8 h-8"
            />
            <p className="ml-3 font-normal">Sepay</p>
          </div>
        );
      case "BANK_TRANSFER":
        return "Chuyển khoản ";
      case "CASH":
        return "Tiền mặt ";
      default:
        return "Không xác định";
    }
  };

  const renderType = (type) => {
    switch (type) {
      case "DEPOSIT":
        return "Nạp tiền";
      case "WITHDRAWAL":
        return "Rút tiền ";
      default:
        return "Không xác định";
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}-${day}-${month}-${year}`;
  };

  const formattedAmount = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(item.amount);

  return (
    <tr key={item.id} className="border-b-[1px]">
      {/* Amount Column */}
      <td className="px-4 py-2 text-[#eeeeee] text-center font-normal">
        {renderAmount(formattedAmount, item.type)}
      </td>
      {/* Type Column */}
      <td className="px-4 py-2 text-[#eeeeee] text-center font-normal">
        {renderType(item.type)}
      </td>
      {/* Payment Method Column */}
      <td className="px-4 py-2 text-[#eeeeee] text-center">
        {renderMethod(item.paymentMethod)}
      </td>
      {/* Status Column */}
      <td className="px-4 py-2 text-center text-base font-normal">
        <p className={`p-1 text-center rounded-lg `}>
          {translateStatus(item.status)}
        </p>
      </td>
      {/* Updated At Column */}
      <td className="px-4 py-2 text-[#eeeeee] text-center text-base font-normal">
        {formatDate(item.updatedAt)}
      </td>
    </tr>
  );
}

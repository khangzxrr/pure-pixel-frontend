import React from "react";

function ComStatusWalletConverter({ children }) {
  const convertStatus = (type) => {
    switch (type) {
      case "SUCCESS":
        return <p className="text-green-500">✓ Thành công</p>;
      case "PENDING":
        return <p className="text-yellow-600">◔ Đang chờ</p>;
      case "CANCEL":
        return <p className="text-red-600">Đã hủy</p>;
      case "FAILED":
        return <p className="text-red-500">Thất bại</p>;
      case "EXPIRED":
        return <p className="text-gray-100">Hết hạn</p>;
      default:
        return type; // Giá trị mặc định nếu không khớp
    }
  };

  const translated = convertStatus(children);

  return <>{translated}</>;
}

export default ComStatusWalletConverter;

import React from "react";

function ComStatusWalletConverter({ children }) {
  const convertStatus = (type) => {
    switch (type) {
      case "SUCCESS":
        return <p className="text-green-500">✓ Thành công</p>;
      case "PENDING":
        return <p className="text-yellow-600">◔ Đang chờ</p>;
      case "Cancelled":
        return <p className="text-red-600">Đã hủy</p>;
      case "Expired":
        return <p className="text-gray-600">Hết hạn</p>;
      default:
        return type; // Giá trị mặc định nếu không khớp
    }
  };

  const translated = convertStatus(children);

  return <>{translated}</>;
}

export default ComStatusWalletConverter;

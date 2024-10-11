import React from "react";

function ComBillStatusConverter({ children }) {
  const convertStatus = (type) => {
    switch (type) {
      case "SUCCESS":
        return <p className="text-blue-600">Thành công</p>;
      case "UnPaid":
        return <p className="text-neutral-950">Chưa thanh toán</p>;
      case "Faied":
        return <p className="text-red-600">Đã hủy</p>;
      case "PENDING":
        return <p className="text-[#eab308]"> Đang chờ</p>;

      default:
        return type; // Giá trị mặc định nếu không khớp
    }
  };

  const translated = convertStatus(children);

  return <>{translated}</>;
}

export default ComBillStatusConverter;

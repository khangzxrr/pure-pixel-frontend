import React from "react";

function ComReportTypeConverter({ children }) {
  const convert = (data) => {
    switch (data) {
      case "PHOTO":
        return "Hình ảnh";
      case "USER":
        return "Người dùng";
      case "BOOKING":
        return "Dịch vụ";
      case "COMMENT":
        return "Bình luận";
      case "other":
        return "Khác";
      default:
        return " "; // Giá trị mặc định nếu không khớp
    }
  };

  const translated = convert(children);

  return <>{translated}</>;
}

export default ComReportTypeConverter;

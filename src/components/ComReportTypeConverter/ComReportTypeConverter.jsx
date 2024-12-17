import React from "react";

function ComReportTypeConverter({ children }) {
  const convert = (data) => {
    switch (data) {
      case "PHOTO":
        return "Hình ảnh";
      case "USER":
        return "Người dùng";
      case "BOOKING":
        return "Gói chụp ảnh từ khách";
      case "BOOKING_PHOTOGRAPHER_REPORT_USER":
        return "Gói chụp ảnh từ n";
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

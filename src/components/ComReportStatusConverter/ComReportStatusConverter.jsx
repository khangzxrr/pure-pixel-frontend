import React from "react";

function ComReportStatusConverter({ children }) {
  const convert = (data) => {
    switch (data) {
      case "OPEN":
        return "Chưa phản hồi";
      case "WAITING_FEEDBACK":
        return "WAITING_FEEDBACK";
      case "RESPONSED":
        return "Đã trả lời";
      case "CLOSED":
        return "Đóng";
      case "other":
        return "Khác";
      default:
        return " "; // Giá trị mặc định nếu không khớp
    }
  };

  const translated = convert(children);

  return <>{translated}</>;
}

export default ComReportStatusConverter;

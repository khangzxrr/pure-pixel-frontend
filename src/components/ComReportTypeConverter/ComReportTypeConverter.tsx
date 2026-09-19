import type { Schema } from "../../apis/types";

type ReportType = Schema<"ReportDto">["reportType"] | "other";

type ComReportTypeConverterProps = {
  children?: ReportType;
};

function ComReportTypeConverter({ children }: ComReportTypeConverterProps) {
  const convert = (data?: ReportType) => {
    switch (data) {
      case "PHOTO":
        return "Hình ảnh";
      case "USER":
        return "Người dùng";
      case "BOOKING":
        return "Gói chụp ảnh từ khách";
      case "BOOKING_PHOTOGRAPHER_REPORT_USER":
        return "Gói chụp ảnh từ nhiếp ảnh gia";
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

import type { Schema } from "../../apis/types";

type ReportStatus = Schema<"ReportDto">["reportStatus"] | "other";

type ComReportStatusConverterProps = {
  children?: ReportStatus;
};

function ComReportStatusConverter({ children }: ComReportStatusConverterProps) {
  const convert = (data?: ReportStatus) => {
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

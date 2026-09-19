import { render } from "@testing-library/react";
import ComReportTypeConverter from "./ComReportTypeConverter";

describe("ComReportTypeConverter", () => {
  it.each([
    ["PHOTO", "Hình ảnh"],
    ["USER", "Người dùng"],
    ["BOOKING", "Gói chụp ảnh từ khách"],
    ["BOOKING_PHOTOGRAPHER_REPORT_USER", "Gói chụp ảnh từ nhiếp ảnh gia"],
    ["COMMENT", "Bình luận"],
    ["other", "Khác"],
  ] as const)("translates %s", (type, label) => {
    const { container } = render(
      <ComReportTypeConverter>{type}</ComReportTypeConverter>,
    );
    expect(container.textContent).toBe(label);
  });

  it("falls back to a blank", () => {
    const { container } = render(<ComReportTypeConverter />);
    expect(container.textContent).toBe(" ");
  });
});

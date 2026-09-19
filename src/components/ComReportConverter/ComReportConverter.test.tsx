import { render } from "@testing-library/react";
import ComReportConverter, { type ReportReference } from "./ComReportConverter";

const report: ReportReference = {
  referencedPhoto: { title: "Hoàng hôn" },
  referencedUser: { name: "Minh" },
  referencedBooking: { photoshootPackageHistory: { title: "Gói cưới" } },
};

const textOf = (data?: ReportReference | null) =>
  render(<ComReportConverter>{data}</ComReportConverter>).container
    .textContent;

describe("ComReportConverter", () => {
  it.each([
    ["PHOTO", "Ảnh Hoàng hôn"],
    ["USER", "Người dùng Minh"],
    ["BOOKING", "Gói chụp Gói cưới"],
    ["BOOKING_PHOTOGRAPHER_REPORT_USER", "Khách của gói chụp Gói cưới"],
    ["COMMENT", "Bình luận"],
    ["other", "Khác"],
  ] as const)("describes %s reports", (reportType, text) => {
    expect(textOf({ ...report, reportType })).toBe(text);
  });

  it("tolerates missing references", () => {
    expect(textOf({ reportType: "PHOTO" })).toBe("Ảnh ");
    expect(textOf({ reportType: "BOOKING", referencedBooking: null })).toBe(
      "Gói chụp ",
    );
  });

  it("falls back to a blank", () => {
    expect(textOf(null)).toBe(" ");
    expect(textOf({})).toBe(" ");
  });
});

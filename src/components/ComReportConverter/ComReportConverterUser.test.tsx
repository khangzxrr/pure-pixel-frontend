import { render, screen } from "@testing-library/react";
import ComReportConverterUser, {
  type ReportedUserReference,
} from "./ComReportConverterUser";

const person = { name: "Minh", avatar: "https://cdn.test/minh.jpg" };

const renderReport = (data?: ReportedUserReference | null) =>
  render(<ComReportConverterUser>{data}</ComReportConverterUser>).container;

describe("ComReportConverterUser", () => {
  it("shows the photographer of a reported photo", () => {
    const container = renderReport({
      reportType: "PHOTO",
      referencedPhoto: { photographer: person },
    });
    expect(screen.getByText("Minh")).toBeInTheDocument();
    expect(container.querySelector("img")).toHaveAttribute("src", person.avatar);
  });

  it("shows a reported user with avatar", () => {
    const container = renderReport({
      reportType: "USER",
      referencedUser: person,
    });
    expect(screen.getByText("Minh")).toBeInTheDocument();
    expect(container.querySelector("img")).toHaveAttribute("src", person.avatar);
  });

  it("skips the avatar when a reported user has none", () => {
    const container = renderReport({
      reportType: "USER",
      referencedUser: { name: "Bảo", avatar: "" },
    });
    expect(screen.getByText("Bảo")).toBeInTheDocument();
    expect(container.querySelector("img")).toBeNull();
  });

  it.each([
    ["BOOKING", "BOOKING"],
    ["COMMENT", "Bình luận"],
    ["other", "Khác"],
  ] as const)("describes %s reports", (reportType, text) => {
    expect(renderReport({ reportType }).textContent).toBe(text);
  });

  it("falls back to a blank", () => {
    expect(renderReport(null).textContent).toBe(" ");
    expect(
      renderReport({ reportType: "BOOKING_PHOTOGRAPHER_REPORT_USER" })
        .textContent,
    ).toBe(" ");
  });
});

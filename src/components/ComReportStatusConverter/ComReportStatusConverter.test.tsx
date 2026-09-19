import { render } from "@testing-library/react";
import ComReportStatusConverter from "./ComReportStatusConverter";

describe("ComReportStatusConverter", () => {
  it.each([
    ["OPEN", "Chưa phản hồi"],
    ["WAITING_FEEDBACK", "WAITING_FEEDBACK"],
    ["RESPONSED", "Đã trả lời"],
    ["CLOSED", "Đóng"],
    ["other", "Khác"],
  ] as const)("translates %s", (status, label) => {
    const { container } = render(
      <ComReportStatusConverter>{status}</ComReportStatusConverter>,
    );
    expect(container.textContent).toBe(label);
  });

  it("falls back to a blank", () => {
    const { container } = render(<ComReportStatusConverter />);
    expect(container.textContent).toBe(" ");
  });
});

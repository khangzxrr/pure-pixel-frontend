import { render, screen } from "@testing-library/react";
import TotalCards, { type DashboardSnapshot } from "./TotalCards";

const snapshot = (data: DashboardSnapshot["data"]): DashboardSnapshot => ({
  createdAt: "2026-09-14T00:00:00.000Z",
  data,
});

// CardTotal renders the name and the value as siblings
const valueOf = (name: string) => screen.getByText(name).nextElementSibling;

describe("TotalCards", () => {
  it("shows the totals of the latest day", () => {
    render(
      <TotalCards
        dataDashboard={[
          snapshot({
            userTotal: 1,
            totalEmployee: 1,
            totalPhoto: 1,
            totalRevenue: 1,
          }),
          snapshot({
            userTotal: 12,
            totalEmployee: 3,
            totalPhoto: 40,
            totalRevenue: 1500000,
          }),
        ]}
      />,
    );

    expect(valueOf("Tổng số người sử dụng")).toHaveTextContent("12");
    expect(valueOf("Tổng số nhân viên")).toHaveTextContent("3");
    expect(valueOf("Tổng số ảnh")).toHaveTextContent("40");
    expect(valueOf("Tổng số tiền")).toHaveTextContent("1.500.000đ");
  });

  it("passes no value on when there is no data", () => {
    render(<TotalCards dataDashboard={[]} />);

    // CardTotal shows its 9999 placeholder for empty values
    expect(valueOf("Tổng số người sử dụng")).toHaveTextContent("9999");
    expect(valueOf("Tổng số nhân viên")).toHaveTextContent("9999");
    expect(valueOf("Tổng số ảnh")).toHaveTextContent("9999");
    expect(valueOf("Tổng số tiền")).toHaveTextContent("undefinedđ");
  });
});

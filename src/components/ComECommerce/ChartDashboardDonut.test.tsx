import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../test/render";
import ChartDashboardDonut from "./ChartDashboardDonut";

vi.mock("./ChartDashboardRevenue", () => ({
  default: (props: Record<string, unknown>) => (
    <div data-testid="dashboard-revenue-chart">{JSON.stringify(props)}</div>
  ),
}));

describe("ChartDashboardDonut", () => {
  it("maps dashboard totals into the photo-size and revenue donut charts", () => {
    renderWithProviders(
      <ChartDashboardDonut
        dashBoardData={{
          revenueFromSellingPhoto: 1200,
          revenueFromUpgradePackage: 3400,
          totalSize: 300,
          totalPhotoSize: 200,
          totalBookingSize: 100,
        } as never}
      />,
    );

    const charts = screen.getAllByTestId("dashboard-revenue-chart");

    expect(charts[0]).toHaveTextContent("Thống kê tổng dung lượng đã sử dụng");
    expect(charts[0]).toHaveTextContent('"param1":100');
    expect(charts[0]).toHaveTextContent('"param2":200');
    expect(charts[0]).toHaveTextContent('"total":300');
    expect(charts[0]).toHaveTextContent('"isPhoto":true');

    expect(charts[1]).toHaveTextContent("Thống kê tổng doanh thu");
    expect(charts[1]).toHaveTextContent('"param1":1200');
    expect(charts[1]).toHaveTextContent('"param2":3400');
    expect(charts[1]).toHaveTextContent('"isMoney":true');
    expect(charts[1]).toHaveTextContent('"isRevenue":true');
  });
});

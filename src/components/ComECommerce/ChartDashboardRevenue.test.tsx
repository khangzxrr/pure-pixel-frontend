import { screen, waitFor } from "@testing-library/react";
import { renderWithProviders } from "../../test/render";
import ChartDashboardRevenue from "./ChartDashboardRevenue";

vi.mock("react-apexcharts", () => ({
  default: ({ options, series, type }: { options: Record<string, unknown>; series: unknown; type: string }) => (
    <div
      data-testid="apexchart"
      data-options={JSON.stringify(options)}
      data-series={JSON.stringify(series)}
      data-type={type}
    />
  ),
}));

describe("ChartDashboardRevenue", () => {
  it("renders revenue totals, formatted money values and chart props", () => {
    renderWithProviders(
      <ChartDashboardRevenue
        nameChart="Thống kê tổng doanh thu"
        nameParam1="Bán ảnh"
        nameParam2="Nâng cấp"
        param1={1200}
        param2={3400}
        isMoney={true}
        isRevenue={true}
      />,
    );

    expect(screen.getByText("Thống kê tổng doanh thu")).toBeInTheDocument();
    expect(screen.getByText("4.600đ")).toBeInTheDocument();
    expect(screen.getByText("1.200đ")).toBeInTheDocument();
    expect(screen.getByText("3.400đ")).toBeInTheDocument();
    expect(screen.getByTestId("apexchart")).toHaveAttribute("data-type", "donut");
    expect(screen.getByTestId("apexchart")).toHaveAttribute("data-series", "[1200,3400]");
    expect(screen.getByTestId("apexchart").getAttribute("data-options")).toContain("Bán ảnh");
    expect(screen.getByTestId("apexchart").getAttribute("data-options")).toContain("Nâng cấp");
  });

  it("renders photo sizes in gigabytes and updates the series when props change", async () => {
    const { rerender } = renderWithProviders(
      <ChartDashboardRevenue
        nameChart="Dung lượng"
        nameParam1="Ảnh bán"
        nameParam2="Ảnh gói"
        param1={1073741824}
        param2={2147483648}
        total={3221225472}
        isPhoto={true}
      />,
    );

    expect(screen.getByText("3.00 GB")).toBeInTheDocument();
    expect(screen.getByText("1.00 GB")).toBeInTheDocument();
    expect(screen.getByText("2.00 GB")).toBeInTheDocument();

    rerender(
      <ChartDashboardRevenue
        nameChart="Dung lượng"
        nameParam1="Ảnh bán"
        nameParam2="Ảnh gói"
        param1={0}
        param2={1073741824}
        total={1073741824}
        isPhoto={true}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText("0 GB")).toBeInTheDocument();
      expect(screen.getByTestId("apexchart")).toHaveAttribute(
        "data-series",
        "[0,1073741824]",
      );
    });
  });

  it("renders raw user counts when user mode is enabled", () => {
    renderWithProviders(
      <ChartDashboardRevenue
        nameChart="Người dùng"
        nameParam1="Khách hàng"
        nameParam2="Nhiếp ảnh gia"
        param1={5}
        param2={7}
        isUser={true}
      />,
    );

    expect(screen.getByText("Khách hàng")).toBeInTheDocument();
    expect(screen.getByText("Nhiếp ảnh gia")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("7")).toBeInTheDocument();
    expect(screen.queryByText(/đ$/)).not.toBeInTheDocument();
  });
});

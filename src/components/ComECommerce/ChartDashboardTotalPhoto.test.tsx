import { screen, waitFor } from "@testing-library/react";
import { renderWithProviders } from "../../test/render";
import ChartDashboardTotalPhoto from "./ChartDashboardTotalPhoto";

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

describe("ChartDashboardTotalPhoto", () => {
  it("renders labels, totals and donut-chart props", async () => {
    const { rerender } = renderWithProviders(
      <ChartDashboardTotalPhoto
        nameChart="Thống kê tổng số ảnh"
        nameParam1="Ảnh bán"
        nameParam2="Ảnh thường"
        nameParam3="Ảnh gói"
        param1={1}
        param2={2}
        param3={3}
      />,
    );

    expect(screen.getByText("Thống kê tổng số ảnh")).toBeInTheDocument();
    expect(screen.getByText("Ảnh bán")).toBeInTheDocument();
    expect(screen.getByText("Ảnh thường")).toBeInTheDocument();
    expect(screen.getByText("Ảnh gói")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByTestId("apexchart")).toHaveAttribute("data-series", "[1,2,3]");
    expect(screen.getByTestId("apexchart").getAttribute("data-options")).toContain("Ảnh gói");

    rerender(
      <ChartDashboardTotalPhoto
        nameChart="Thống kê tổng số ảnh"
        nameParam1="Ảnh bán"
        nameParam2="Ảnh thường"
        nameParam3="Ảnh gói"
        param1={4}
        param2={5}
        param3={6}
      />,
    );

    await waitFor(() => {
      expect(screen.getByTestId("apexchart")).toHaveAttribute("data-series", "[4,5,6]");
    });
  });
});

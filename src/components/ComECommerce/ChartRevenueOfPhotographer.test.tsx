import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../test/render";
import ChartRevenueOfPhotographer from "./ChartRevenueOfPhotographer";

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

describe("ChartRevenueOfPhotographer", () => {
  it("renders the fixed revenue summary and donut chart props", () => {
    renderWithProviders(<ChartRevenueOfPhotographer />);

    expect(screen.getByText("Thống kê tổng doanh thu")).toBeInTheDocument();
    expect(screen.getByText("Doanh thu gói dịch vụ")).toBeInTheDocument();
    expect(screen.getByText("Doanh thu bán ảnh")).toBeInTheDocument();
    expect(
      screen.getByText((_, element) => element?.textContent === "15,000,000đ"),
    ).toBeInTheDocument();
    expect(
      screen.getByText((_, element) => element?.textContent === "5,000,000đ"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("apexchart")).toHaveAttribute("data-type", "donut");
    expect(screen.getByTestId("apexchart")).toHaveAttribute(
      "data-series",
      "[5000000,15000000]",
    );
    expect(screen.getByTestId("apexchart").getAttribute("data-options")).toContain(
      "Doanh thu bán ảnh",
    );
  });
});

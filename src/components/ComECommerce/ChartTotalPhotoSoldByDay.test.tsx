import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../test/render";
import ChartTotalPhotoSoldByDay from "./ChartTotalPhotoSoldByDay";

vi.mock("react-apexcharts", () => ({
  default: ({ options, series, type, height }: { options: Record<string, unknown>; series: Array<{ name: string; data: number[] }>; type: string; height?: number }) => (
    <div
      data-testid="apexchart"
      data-options={JSON.stringify(options)}
      data-series={JSON.stringify(series)}
      data-type={type}
      data-height={String(height)}
    >
      <p data-testid="series-name">{series[0]?.name}</p>
      <p data-testid="series-size">{series[0]?.data.length}</p>
    </div>
  ),
}));

describe("ChartTotalPhotoSoldByDay", () => {
  it("renders the area chart with the configured monthly series", () => {
    renderWithProviders(<ChartTotalPhotoSoldByDay />);

    expect(screen.getByText("Thống kê số ảnh được bán mỗi ngày")).toBeInTheDocument();
    expect(screen.getByTestId("apexchart")).toHaveAttribute("data-type", "area");
    expect(screen.getByTestId("apexchart")).toHaveAttribute("data-height", "350");
    expect(screen.getByTestId("series-name")).toHaveTextContent("Gói căn bản");
    expect(screen.getByTestId("series-size")).toHaveTextContent("12");
    expect(screen.getByTestId("apexchart").getAttribute("data-options")).toContain(
      '"categories":["Sep","Oct","Nov","Dec","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug"]',
    );
  });
});

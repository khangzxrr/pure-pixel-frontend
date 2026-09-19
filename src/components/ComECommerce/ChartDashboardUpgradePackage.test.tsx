import { screen, waitFor } from "@testing-library/react";
import { renderWithProviders } from "../../test/render";
import ChartDashboardUpgradePackage from "./ChartDashboardUpgradePackage";

vi.mock("react-apexcharts", () => ({
  default: ({ options, series, type, height, className }: { options: Record<string, unknown>; series: unknown; type: string; height?: number; className?: string }) => (
    <div
      data-testid="apexchart"
      data-options={JSON.stringify(options)}
      data-series={JSON.stringify(series)}
      data-type={type}
      data-height={String(height)}
      data-class={className ?? ""}
    />
  ),
}));

describe("ChartDashboardUpgradePackage", () => {
  it("shows the title and no chart when there is no package data", () => {
    renderWithProviders(<ChartDashboardUpgradePackage />);

    expect(
      screen.getByText("Thông kê số lượng người dùng nâng cấp theo gói"),
    ).toBeInTheDocument();
    expect(screen.queryByTestId("apexchart")).not.toBeInTheDocument();
  });

  it("builds the bar-chart series, colors and bounds from the dashboard data", async () => {
    renderWithProviders(
      <ChartDashboardUpgradePackage
        dashBoardData={{
          topUsedUpgradePackage: [
            { totalUsed: 8, upgradePackageDto: { name: "Nâng cao" } },
            { totalUsed: 4, upgradePackageDto: { name: "Bắt đầu" } },
            { totalUsed: 2, upgradePackageDto: { name: "Cao cấp" } },
          ],
        } as never}
      />,
    );

    await waitFor(() => {
      expect(screen.getByTestId("apexchart")).toBeInTheDocument();
    });

    expect(screen.getByTestId("apexchart")).toHaveAttribute("data-type", "bar");
    expect(screen.getByTestId("apexchart")).toHaveAttribute("data-height", "420");
    expect(screen.getByTestId("apexchart")).toHaveAttribute("data-class", "-ml-5");
    expect(screen.getByTestId("apexchart").getAttribute("data-series")).toContain(
      "Số lượng người dùng nâng cấp gói này là",
    );
    expect(screen.getByTestId("apexchart").getAttribute("data-series")).toContain(
      '"fillColor":"#00eeff"',
    );
    expect(screen.getByTestId("apexchart").getAttribute("data-series")).toContain(
      '"fillColor":"#0dff00"',
    );
    expect(screen.getByTestId("apexchart").getAttribute("data-series")).toContain(
      '"fillColor":"#ffe100"',
    );
    expect(screen.getByTestId("apexchart").getAttribute("data-options")).toContain(
      '"max":10',
    );
    expect(screen.getByTestId("apexchart").getAttribute("data-options")).toContain(
      '"tickAmount":4',
    );
    expect(screen.getByTestId("apexchart").getAttribute("data-options")).toContain(
      "Gói nâng cao",
    );
  });
});

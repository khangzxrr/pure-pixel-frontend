import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../test/render";
import ChartDashboard from "./ChartDashboard";

vi.mock("./ChartDashboardUpgradePackage", () => ({
  default: ({ dashBoardData }: { dashBoardData?: unknown }) => (
    <div data-testid="upgrade-package-chart">{JSON.stringify(dashBoardData)}</div>
  ),
}));

describe("ChartDashboard", () => {
  it("passes dashboard data to the upgrade-package chart", () => {
    const dashBoardData = {
      topUsedUpgradePackage: [{ totalUsed: 3, upgradePackageDto: { name: "Nâng cao" } }],
    };

    renderWithProviders(<ChartDashboard dashBoardData={dashBoardData as never} />);

    expect(screen.getByTestId("upgrade-package-chart")).toHaveTextContent("Nâng cao");
    expect(screen.getByTestId("upgrade-package-chart")).toHaveTextContent("3");
  });
});

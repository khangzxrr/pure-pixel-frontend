import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../test/render";
import ComTotalUsers from "./ComTotalUsers";

type ApexChartStubProps = {
  type: string;
  series?: number[];
  options?: { labels?: string[] };
};

vi.mock("react-apexcharts", () => ({
  default: ({ type, series = [], options }: ApexChartStubProps) => (
    <div data-testid="apex-chart-stub">
      {type}:{series.join(",")}:{options?.labels?.join(",")}
    </div>
  ),
}));

describe("ComTotalUsers", () => {
  it("renders the revenue chart container", () => {
    const { container } = renderWithProviders(<ComTotalUsers />);

    expect(screen.getByTestId("apex-chart-stub")).toHaveTextContent("donut");
    expect(container.querySelector("#chartDashboardRevenue")).toBeInTheDocument();
  });
});

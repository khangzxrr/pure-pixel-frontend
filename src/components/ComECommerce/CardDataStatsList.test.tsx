import { fireEvent, screen, waitFor } from "@testing-library/react";
import { renderWithProviders } from "../../test/render";
import CardDataStatsList from "./CardDataStatsList";

vi.mock("./CardDataStats", () => ({
  default: ({ label, dataCount, onClick, isScaleHover = true }: Record<string, unknown>) => (
    <button
      data-testid={`card-${String(label)}`}
      data-count={String(dataCount)}
      data-scale-hover={String(isScaleHover)}
      onClick={onClick as () => void}
    >
      {String(label)}
    </button>
  ),
}));

vi.mock("./CardBalance", () => ({
  default: ({ balance, withdrawal }: { balance?: number; withdrawal?: number }) => (
    <div data-testid="card-balance">{`${balance}-${withdrawal}`}</div>
  ),
}));

vi.mock("./ChartDashboardRevenue", () => ({
  default: (props: Record<string, unknown>) => (
    <div data-testid="chart-dashboard-revenue">{JSON.stringify(props)}</div>
  ),
}));

vi.mock("./ChartDashboardTotalPhoto", () => ({
  default: (props: Record<string, unknown>) => (
    <div data-testid="chart-dashboard-total-photo">{JSON.stringify(props)}</div>
  ),
}));

describe("CardDataStatsList", () => {
  const data = {
    totalCustomer: 5,
    totalPhotographer: 7,
    totalPhoto: 12,
    totalPhotoshootPackage: 9,
    totalSellingPhoto: 3,
    totalRawPhoto: 4,
    totalBookingPhoto: 5,
    revenueFromSellingPhoto: 1000,
    revenueFromUpgradePackage: 2000,
    totalWithdrawal: 400,
    totalBalance: 9000,
  } as never;

  afterEach(() => {
    document.body.style.overflow = "";
    document.body.className = "";
  });

  it("renders cards, passes counts and opens/closes the user modal", async () => {
    const { container } = renderWithProviders(<CardDataStatsList data={data} />);

    expect(screen.getByTestId("card-Tổng số người đăng ký")).toHaveAttribute(
      "data-count",
      "12",
    );
    expect(screen.getByTestId("card-Tổng số ảnh")).toHaveAttribute(
      "data-count",
      "12",
    );
    expect(screen.getByTestId("card-Tổng số gói dịch vụ")).toHaveAttribute(
      "data-count",
      "9",
    );
    expect(screen.getByTestId("card-Tổng số gói dịch vụ")).toHaveAttribute(
      "data-scale-hover",
      "false",
    );
    expect(screen.getByTestId("card-balance")).toHaveTextContent("9000-400");

    fireEvent.click(screen.getByTestId("card-Tổng số người đăng ký"));

    expect(screen.getByTestId("chart-dashboard-revenue")).toHaveTextContent(
      '"isUser":true',
    );
    expect(screen.getByTestId("chart-dashboard-revenue")).toHaveTextContent(
      '"param1":5',
    );
    expect(document.body.style.overflow).toBe("hidden");
    expect(container.querySelector("div.fixed.inset-0")).toBeInTheDocument();

    fireEvent.click(container.querySelector("div.fixed.inset-0") as HTMLElement);

    await waitFor(() => {
      expect(screen.queryByTestId("chart-dashboard-revenue")).not.toBeInTheDocument();
      expect(document.body.style.overflow).toBe("auto");
    });
  });

  it("opens the total-photo modal with the expected aggregated props", () => {
    renderWithProviders(<CardDataStatsList data={data} />);

    fireEvent.click(screen.getByTestId("card-Tổng số ảnh"));

    expect(screen.getByTestId("chart-dashboard-total-photo")).toHaveTextContent(
      "Thống kê tổng số ảnh",
    );
    expect(screen.getByTestId("chart-dashboard-total-photo")).toHaveTextContent(
      '"param1":3',
    );
    expect(screen.getByTestId("chart-dashboard-total-photo")).toHaveTextContent(
      '"param2":4',
    );
    expect(screen.getByTestId("chart-dashboard-total-photo")).toHaveTextContent(
      '"param3":5',
    );
  });
});

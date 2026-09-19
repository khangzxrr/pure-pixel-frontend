import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import dayjs from "dayjs";
import { renderWithProviders } from "../test/render";
import UseECommerceStore from "../states/UseECommerceStore";
import ECommerceLayout from "./ECommerceLayout";

const dashboardMock = vi.fn();
const topSellerMock = vi.fn();
const topCameraMock = vi.fn();

vi.mock("../apis/AdminApi", () => ({
  default: {
    getDashboard: (...args: unknown[]) => dashboardMock(...args),
    getTopSellerDashboard: (...args: unknown[]) => topSellerMock(...args),
  },
}));

vi.mock("../apis/CameraApi", () => ({
  default: {
    getTopCameras: (...args: unknown[]) => topCameraMock(...args),
  },
}));

vi.mock("../components/ComECommerce/CardDataStatsList", () => ({
  default: ({ data }: { data?: { label?: string } }) => <div>stats {data?.label}</div>,
}));

vi.mock("../components/ComECommerce/ChartDashboard", () => ({
  default: ({ dashBoardData }: { dashBoardData?: { label?: string } }) => (
    <div>chart {dashBoardData?.label}</div>
  ),
}));

vi.mock("../components/ComECommerce/Table", () => ({
  default: ({ dataTopSeller }: { dataTopSeller?: Array<{ id: string }> }) => (
    <div>top sellers {dataTopSeller?.length ?? 0}</div>
  ),
}));

vi.mock("../components/LoadingSpinner/LoadingOval", () => ({
  default: () => <div>loading spinner</div>,
}));

vi.mock("../components/ComECommerce/TableCameraList", () => ({
  default: ({ dataCamera }: { dataCamera?: Array<{ id: string }> }) => (
    <div>top cameras {dataCamera?.length ?? 0}</div>
  ),
}));

vi.mock("../components/ComECommerce/ChartDashboardRevenue", () => ({
  default: () => <div>revenue chart</div>,
}));

vi.mock("../components/ComECommerce/ChartTotalUsedCameraByBrand", () => ({
  default: () => <div>brand chart</div>,
}));

vi.mock("../components/ComECommerce/ChartDashboardDonut", () => ({
  default: ({ dashBoardData }: { dashBoardData?: { label?: string } }) => (
    <div>donut {dashBoardData?.label}</div>
  ),
}));

vi.mock("antd", async () => {
  const actual = await vi.importActual<Record<string, unknown>>("antd");
  return {
    ...actual,
    ConfigProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    DatePicker: {
      RangePicker: ({
        defaultValue,
        onChange,
        disabledDate,
      }: {
        defaultValue?: unknown[];
        onChange?: (value: Array<{ $d: Date }>) => void;
        disabledDate: (value: dayjs.Dayjs) => boolean;
      }) => (
        <div>
          <div data-testid="default-range">{String(defaultValue?.length ?? 0)}</div>
          <div data-testid="disable-before">
            {String(disabledDate(dayjs("2024-07-31")))}
          </div>
          <div data-testid="disable-valid">
            {String(disabledDate(dayjs("2024-08-10")))}
          </div>
          <button
            onClick={() =>
              onChange?.([
                { $d: new Date("2025-01-01T00:00:00.000Z") },
                { $d: new Date("2025-01-31T00:00:00.000Z") },
              ])
            }
            type="button"
          >
            pick range
          </button>
        </div>
      ),
    },
  };
});

beforeEach(() => {
  dashboardMock.mockReset();
  topSellerMock.mockReset();
  topCameraMock.mockReset();
  UseECommerceStore.setState({
    fromDate: new Date("2024-09-01T00:00:00.000Z"),
    toDate: new Date("2024-09-10T00:00:00.000Z"),
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("ECommerceLayout", () => {
  it("shows the loading spinner while dashboard queries are in flight", () => {
    dashboardMock.mockReturnValue(new Promise(() => {}));
    topSellerMock.mockReturnValue(new Promise(() => {}));
    topCameraMock.mockReturnValue(new Promise(() => {}));

    renderWithProviders(<ECommerceLayout />);

    expect(screen.getByText("loading spinner")).toBeInTheDocument();
  });

  it("renders dashboard widgets, updates the date range and refreshes the data", async () => {
    dashboardMock.mockResolvedValue({ label: "dashboard-data" });
    topSellerMock.mockResolvedValue([{ id: "seller-1" }]);
    topCameraMock.mockResolvedValue([{ id: "camera-1" }]);

    renderWithProviders(<ECommerceLayout />);

    expect(await screen.findByText("stats dashboard-data")).toBeInTheDocument();
    expect(screen.getByText("donut dashboard-data")).toBeInTheDocument();
    expect(screen.getByText("chart dashboard-data")).toBeInTheDocument();
    expect(screen.getByText("top sellers 1")).toBeInTheDocument();
    expect(screen.getByText("top cameras 1")).toBeInTheDocument();
    expect(screen.getByText("brand chart")).toBeInTheDocument();
    expect(screen.getByTestId("default-range")).toHaveTextContent("2");
    expect(screen.getByTestId("disable-before")).toHaveTextContent("true");
    expect(screen.getByTestId("disable-valid")).toHaveTextContent("false");

    expect(dashboardMock).toHaveBeenCalledWith(
      "2024-09-01T00:00:00.000Z",
      "2024-09-10T00:00:00.000Z",
    );
    expect(topSellerMock).toHaveBeenCalledWith(
      "2024-09-01T00:00:00.000Z",
      "2024-09-10T00:00:00.000Z",
    );
    expect(topCameraMock).toHaveBeenCalledWith(10);

    await userEvent.click(screen.getByRole("button", { name: "pick range" }));
    await userEvent.click(screen.getByRole("button", { name: "Xác nhận" }));

    await waitFor(() =>
      expect(UseECommerceStore.getState().fromDate).toEqual(
        new Date("2025-01-01T00:00:00.000Z"),
      ),
    );
    await waitFor(() => expect(dashboardMock).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(topSellerMock).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(topCameraMock).toHaveBeenCalledTimes(2));

    await userEvent.click(screen.getByTitle("Làm mới"));

    await waitFor(() => expect(dashboardMock).toHaveBeenCalledTimes(3));
    await waitFor(() => expect(topSellerMock).toHaveBeenCalledTimes(3));
    expect(topCameraMock).toHaveBeenCalledTimes(2);
  });
});

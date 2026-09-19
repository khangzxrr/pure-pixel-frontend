import { screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { renderWithProviders } from "../../test/render";
import { server } from "../../test/server";
import { mockEndpoint } from "../../test/mockEndpoint";
import type { DashboardSnapshot } from "./TotalCards";
import StatiticsPage from "./StatiticsPage";

type ChartProps = {
  nameChart: string;
  labelArray: string[];
  dataArray: Array<number | undefined>;
};

const navigate = vi.hoisted(() => vi.fn());
const token = vi.hoisted(() => ({
  parsed: undefined as
    | { resource_access?: { purepixel?: { roles: string[] } } }
    | undefined,
}));

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-router-dom")>()),
  useNavigate: () => navigate,
}));

vi.mock("../../services/Keycloak", () => ({
  default: {
    isLoggedIn: () => false,
    getToken: () => undefined,
    getTokenParsed: () => token.parsed,
  },
}));

// the charts draw on a canvas, which jsdom does not provide
vi.mock("../../components/ComAdmin/TotalMoneyUpgrade", () => ({
  default: ({ nameChart, labelArray, dataArray }: ChartProps) => (
    <div>
      {nameChart}: {labelArray.join(",")} = {dataArray.join(",")}
    </div>
  ),
}));
vi.mock("../../components/ComAdmin/BarChart", () => ({
  default: ({ nameChart, labelArray, dataArray }: ChartProps) => (
    <div>
      bar {nameChart}: {labelArray.join(",")} = {dataArray.join(",")}
    </div>
  ),
}));
vi.mock("../../components/ComAdmin/TopPhotoSelling", () => ({
  default: ({ dataLastDays }: { dataLastDays?: DashboardSnapshot }) => (
    <div>top selling: {dataLastDays ? dataLastDays.createdAt : "none"}</div>
  ),
}));

const day = (
  date: Date,
  data: DashboardSnapshot["data"],
): DashboardSnapshot => ({ createdAt: date.toISOString(), data });

const history = [
  day(new Date(2026, 8, 13, 10), {
    revenueFromUpgradePackage: 100,
    revenueFromSellingPhoto: 30,
    userTotal: 5,
    totalPhoto: 7,
    totalEmployee: 2,
    totalRevenue: 130,
  }),
  day(new Date(2026, 8, 14, 10), {
    revenueFromUpgradePackage: 200,
    revenueFromSellingPhoto: 60,
    userTotal: 6,
    totalPhoto: 9,
    totalEmployee: 2,
    totalRevenue: 260,
  }),
];

describe("StatiticsPage", () => {
  beforeEach(() => {
    token.parsed = undefined;
    // only Date is faked so react-query and MSW keep their timers
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(2026, 8, 15, 12));
  });

  afterEach(() => {
    vi.useRealTimers();
    navigate.mockReset();
  });

  it("loads the last seven days and charts them", async () => {
    const requests = mockEndpoint("get", "*/admin/dashboard", history);

    renderWithProviders(<StatiticsPage />);

    expect(screen.getByText("Loading...")).toBeInTheDocument();
    expect(
      await screen.findByText("Thống kê số tiền gói nâng cấp: 13/09,14/09 = 100,200"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Thống kê số tiền hoa hồng từ bán ảnh: 13/09,14/09 = 30,60"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("bar Thống kê số lượng người dùng: 13/09,14/09 = 5,6"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Thống kê số lượng ảnh: 13/09,14/09 = 7,9"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(`top selling: ${history[1].createdAt}`),
    ).toBeInTheDocument();
    // TotalCards shows the latest day
    expect(screen.getByText("Tổng số người sử dụng").nextElementSibling).toHaveTextContent("6");

    expect(requests).toHaveLength(1);
    expect(requests[0].query).toEqual({
      fromDate: new Date(2026, 8, 8, 12).toISOString(),
      toDate: new Date(2026, 8, 15, 12).toISOString(),
    });
    expect(navigate).not.toHaveBeenCalled();
  });

  it("shows the request error", async () => {
    server.use(
      http.get("*/admin/dashboard", () => new HttpResponse(null, { status: 500 })),
    );

    renderWithProviders(<StatiticsPage />);

    expect(
      await screen.findByText("Error: Request failed with status code 500"),
    ).toBeInTheDocument();
  });

  it("charts nothing when the dashboard is not a list of days", async () => {
    mockEndpoint("get", "*/admin/dashboard", { totalRevenue: 10 });

    renderWithProviders(<StatiticsPage />);

    expect(await screen.findByText("top selling: none")).toBeInTheDocument();
    expect(screen.getByText("Thống kê số lượng ảnh: =")).toBeInTheDocument();
  });

  it("sends managers to the upgrade management page", async () => {
    token.parsed = { resource_access: { purepixel: { roles: ["manager"] } } };
    mockEndpoint("get", "*/admin/dashboard", history);

    renderWithProviders(<StatiticsPage />);

    await screen.findByText(/top selling/);
    expect(navigate).toHaveBeenCalledWith("/admin/upgrade");
  });

  it("keeps admins on the page", async () => {
    token.parsed = {
      resource_access: { purepixel: { roles: ["purepixel-admin"] } },
    };
    mockEndpoint("get", "*/admin/dashboard", history);

    renderWithProviders(<StatiticsPage />);

    await screen.findByText(/top selling/);
    expect(navigate).not.toHaveBeenCalled();
  });
});

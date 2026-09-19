import { cleanup, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { renderWithProviders } from "../../test/render";
import { mockEndpoint } from "../../test/mockEndpoint";
import { server } from "../../test/server";
import UseECommerceStore from "../../states/UseECommerceStore";
import { FormatDate } from "../../utils/FormatDate";
import PhotographerDetailStats from "./PhotographerDetailStats";

vi.mock("../../services/Keycloak", () => ({
  default: { isLoggedIn: () => false, getToken: () => undefined },
}));

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

const initialStoreState = UseECommerceStore.getState();
const fromDate = new Date("2024-10-01T00:00:00.000Z");
const toDate = new Date("2024-10-05T00:00:00.000Z");
const route = "/stats/ptg-1";
const path = "/stats/:photographerId";

describe("PhotographerDetailStats", () => {
  beforeEach(() => {
    UseECommerceStore.setState({ fromDate, toDate });
  });

  afterEach(() => {
    cleanup();
    UseECommerceStore.setState({
      fromDate: initialStoreState.fromDate,
      toDate: initialStoreState.toDate,
    });
  });

  it("shows a loading spinner while the photographer dashboard is fetching", () => {
    server.use(
      http.get(
        "*/admin/dashboard/top-seller/ptg-1",
        () =>
          new Promise((resolve) => {
            setTimeout(() => {
              resolve(
                HttpResponse.json({
                  user: {},
                  photoSellRevenue: 0,
                  photoshootPackageRevenue: 0,
                  topSoldPhotos: [],
                  topPhotoshootPackages: [],
                }),
              );
            }, 1000);
          }),
      ),
    );

    renderWithProviders(<PhotographerDetailStats />, {
      route,
      path,
    });

    expect(screen.getByText(/Dữ liệu được thống kê từ ngày/)).toHaveTextContent(
      `${FormatDate(fromDate)} - ${FormatDate(toDate)}`,
    );
    expect(screen.getByLabelText("oval-loading")).toBeInTheDocument();
  });

  it("renders an API error message when the query fails", async () => {
    server.use(
      http.get(
        "*/admin/dashboard/top-seller/ptg-1",
        () =>
          HttpResponse.json(
            { message: "Không thể tải dữ liệu nhiếp ảnh gia" },
            { status: 500 },
          ),
      ),
    );

    renderWithProviders(<PhotographerDetailStats />, {
      route,
      path,
    });

    expect(
      await screen.findByText("Xảy ra lỗi trong quá trình cập nhật thông tin"),
    ).toBeInTheDocument();
    expect(screen.getByText(/Không thể tải dữ liệu nhiếp ảnh gia/)).toBeInTheDocument();
  });

  it("renders the photographer details, nested tables and supports refresh", async () => {
    const requests = mockEndpoint("get", "*/admin/dashboard/top-seller/ptg-1", {
      user: {
        name: "Nguyen An",
        avatar: "https://example.com/avatar.jpg",
        cover: "https://example.com/cover.jpg",
        location: "Ho Chi Minh City",
        mail: "an@example.com",
        phonenumber: "0123456789",
        createdAt: "2024-01-20T12:00:00.000Z",
      },
      photoSellRevenue: 1500000,
      photoshootPackageRevenue: 2500000,
      topSoldPhotos: [
        {
          detail: {
            title: "Sunrise Over Saigon",
            signedUrl: {
              thumbnail: "https://example.com/photo-thumb.jpg",
            },
            createdAt: "2024-03-10T12:00:00.000Z",
          },
          soldCount: 7,
        },
      ],
      topPhotoshootPackages: [
        {
          id: "pkg-1",
          thumbnail: "https://example.com/package-thumb.jpg",
          title: "Wedding Premium",
          createdAt: "2024-04-01T12:00:00.000Z",
          price: 4000000,
          _count: { bookings: 3 },
        },
      ],
    });

    renderWithProviders(<PhotographerDetailStats />, {
      route,
      path,
    });

    expect(await screen.findByText("Nguyen An")).toBeInTheDocument();
    expect(screen.getByText("Ho Chi Minh City")).toBeInTheDocument();
    expect(screen.getByText("an@example.com")).toBeInTheDocument();
    expect(screen.getByText("0123456789")).toBeInTheDocument();
    expect(screen.getByText("Tổng doanh thu")).toBeInTheDocument();
    expect(screen.getAllByText("4.000.000đ").length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText("Thống kê tổng doanh thu")).toBeInTheDocument();
    expect(screen.getByText("Doanh thu bán ảnh")).toBeInTheDocument();
    expect(screen.getByText("Doanh thu gói dịch vụ")).toBeInTheDocument();
    expect(screen.getByText("1.500.000đ")).toBeInTheDocument();
    expect(screen.getByText("2.500.000đ")).toBeInTheDocument();
    expect(screen.getByTestId("apex-chart-stub")).toHaveTextContent(
      "donut:1500000,2500000:Doanh thu bán ảnh,Doanh thu gói dịch vụ",
    );
    expect(
      screen.getByText("Danh sách xếp hạng các ảnh được mua nhiều nhất"),
    ).toBeInTheDocument();
    expect(screen.getByText("Sunrise Over Saigon")).toBeInTheDocument();
    expect(screen.getByText("7 ảnh")).toBeInTheDocument();
    expect(screen.getByText(FormatDate("2024-03-10T12:00:00.000Z"))).toBeInTheDocument();
    expect(screen.getByText("Danh sách xếp hạng các gói dịch vụ")).toBeInTheDocument();
    expect(screen.getByText("Wedding Premium")).toBeInTheDocument();
    expect(screen.getAllByText("4.000.000đ").length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText("3 lượt đặt")).toBeInTheDocument();

    await userEvent.click(screen.getByTitle("Làm mới"));

    await waitFor(() => expect(requests).toHaveLength(2));
    expect(requests[0]).toEqual(
      expect.objectContaining({
        method: "GET",
        path: "/admin/dashboard/top-seller/ptg-1",
        query: {
          fromDate: fromDate.toISOString(),
          toDate: toDate.toISOString(),
        },
      }),
    );
    expect(requests[1]).toEqual(
      expect.objectContaining({
        method: "GET",
        path: "/admin/dashboard/top-seller/ptg-1",
        query: {
          fromDate: fromDate.toISOString(),
          toDate: toDate.toISOString(),
        },
      }),
    );
  });
});

import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { MockInstance } from "vitest";
import { renderWithProviders } from "../../test/render";
import { mockEndpoint } from "../../test/mockEndpoint";
import type { Schema } from "../../apis/types";
import CustomerBooking from "./CustomerBooking";

type Booking = Schema<"BookingDto"> & { updatedAt?: string };

const navigate = vi.hoisted(() => vi.fn());

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-router-dom")>()),
  useNavigate: () => navigate,
}));

vi.mock("../../services/Keycloak", () => ({
  default: { isLoggedIn: () => false, getToken: () => undefined },
}));

const LIST_URL = "*/customer/booking/me";

const photographer: Schema<"UserDto"> = {
  id: "ptg-1",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  roles: ["photographer"],
  enabled: true,
  username: "ptg",
  cover: "",
  location: "",
  mail: "",
  phonenumber: "",
  socialLinks: [],
  expertises: [],
  avatar: "https://cdn.test/ptg.jpg",
  name: "Nhiếp Ảnh",
  quote: "",
};

const booking = (overrides: Partial<Booking>): Booking => ({
  id: "b1",
  startDate: new Date(2026, 8, 20, 8).toISOString(),
  endDate: new Date(2026, 8, 20, 17).toISOString(),
  successedAt: null,
  status: "ACCEPTED",
  description: "Chụp ngoài trời",
  photoshootPackageHistory: {
    title: "Gói cưới",
    subtitle: "",
    price: 2000000,
    thumbnail: "https://cdn.test/thumb.jpg",
    description: "",
  },
  originalPhotoshootPackage: {
    id: "pk1",
    title: "Gói cưới",
    subtitle: "",
    price: 2000000,
    thumbnail: "",
    description: "",
    status: "ENABLED",
    user: photographer,
    reviews: [],
    showcases: [],
  },
  billItems: [],
  totalBillItem: 0,
  updatedAt: new Date(2026, 8, 15, 10).toISOString(),
  ...overrides,
});

const bookings = [
  booking({ id: "b1", status: "ACCEPTED" }),
  booking({ id: "b2", status: "REQUESTED", description: "" }),
  booking({ id: "b3", status: "FAILED" }),
];

const serveBookings = (objects: Booking[] = bookings, totalPage = 1) =>
  mockEndpoint("get", LIST_URL, { objects, totalPage, totalRecord: objects.length });

// status labels also name the filter buttons; only the card copy sits inside a card
const cardOf = (text: string) =>
  screen
    .getAllByText(text)
    .map((element) => element.closest(".group"))
    .find((card) => card !== null) as HTMLElement;

describe("CustomerBooking", () => {
  let consoleError: MockInstance<typeof console.error>;

  beforeEach(() => {
    consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    navigate.mockReset();
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(2026, 8, 15, 12));
  });

  afterEach(() => {
    vi.useRealTimers();
    // antd's tooltips fall back to the deprecated findDOMNode around the icons
    const unexpected = consoleError.mock.calls
      .map((args) => args.map(String).join(" "))
      .filter((message) => !message.includes("deprecated"));
    consoleError.mockRestore();
    expect(unexpected.join("\n")).toBe("");
  });

  it("lists my bookings newest first", async () => {
    const requests = serveBookings();

    const { container } = renderWithProviders(<CustomerBooking />);

    expect(screen.getByText("Đang tải")).toBeInTheDocument();
    expect(await screen.findByText("Chờ xác nhận", { selector: "div" })).toBeInTheDocument();
    expect(requests[0].query).toEqual({
      limit: "8",
      page: "0",
      orderByCreatedAt: "desc",
    });

    const accepted = within(cardOf("Đang thực hiện"));
    expect(accepted.getByText("Gói cưới")).toBeInTheDocument();
    expect(accepted.getByText("2.000.000đ")).toBeInTheDocument();
    expect(accepted.getByText("Chụp ngoài trời")).toBeInTheDocument();
    expect(accepted.getByText("Cập nhật 2 giờ trước")).toBeInTheDocument();
    expect(accepted.getByText("Nhiếp Ảnh")).toBeInTheDocument();
    expect(screen.getAllByText("Đang thực hiện").at(-1)).toHaveStyle({ color: "#007BFF" });

    expect(within(cardOf("Chờ xác nhận")).getByText("Không có")).toBeInTheDocument();
    // cancelled bookings cannot be reported
    expect(
      container.querySelectorAll('svg[class*="hover:opacity-80"]'),
    ).toHaveLength(2);
  });

  it("filters by status", async () => {
    const requests = serveBookings();
    renderWithProviders(<CustomerBooking />);
    await screen.findAllByText("Chụp ngoài trời");

    const successed = screen.getByRole("button", { name: "Hoàn thành" });
    expect(successed).toHaveStyle({ backgroundColor: "#28A745" });
    await userEvent.click(successed);

    await waitFor(() =>
      expect(requests.at(-1)?.query).toEqual({
        limit: "8",
        page: "0",
        status: "SUCCESSED",
        orderByCreatedAt: "desc",
      }),
    );
    expect(successed).toHaveStyle({ backgroundColor: "#fff", color: "#28A745" });
  });

  it("uses the chosen order for the next request", async () => {
    const requests = serveBookings();
    renderWithProviders(<CustomerBooking />);
    await screen.findAllByText("Chụp ngoài trời");

    await userEvent.click(screen.getByRole("combobox"));
    await userEvent.click(await screen.findByTitle("Cũ nhất"));
    // the order is not part of the query key, so it only applies to the next status or page
    expect(requests).toHaveLength(1);

    await userEvent.click(screen.getByRole("button", { name: "Từ chối" }));
    await waitFor(() =>
      expect(requests.at(-1)?.query).toEqual({
        limit: "8",
        page: "0",
        status: "DENIED",
        orderByCreatedAt: "asc",
      }),
    );
  });

  it("pages through the bookings", async () => {
    const requests = serveBookings(bookings, 2);
    renderWithProviders(<CustomerBooking />);
    await screen.findAllByText("Chụp ngoài trời");

    await userEvent.click(screen.getByTitle("2"));
    await waitFor(() => expect(requests.at(-1)?.query.page).toBe("1"));
    const count = requests.length;

    await userEvent.click(screen.getByTitle("2"));
    expect(requests).toHaveLength(count);
  });

  it("shows the empty state", async () => {
    serveBookings([]);
    renderWithProviders(<CustomerBooking />);

    expect(
      await screen.findByText("Không có gói buổi chụp nào!"),
    ).toBeInTheDocument();
    expect(screen.queryByTitle("2")).toBeNull();
  });

  it("opens accepted bookings and photographer profiles", async () => {
    serveBookings();
    renderWithProviders(<CustomerBooking />);
    await screen.findAllByText("Chụp ngoài trời");

    await userEvent.click(cardOf("Chờ xác nhận"));
    expect(navigate).not.toHaveBeenCalled();

    await userEvent.click(cardOf("Đang thực hiện"));
    expect(navigate).toHaveBeenCalledWith("/profile/customer-booking/b1");

    navigate.mockReset();
    await userEvent.click(within(cardOf("Chờ xác nhận")).getByText("Nhiếp Ảnh"));
    expect(navigate).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledWith("/user/ptg-1");
  });

  it("shows successful bookings and unknown statuses", async () => {
    serveBookings([
      booking({ id: "b4", status: "SUCCESSED" }),
      booking({
        id: "b5",
        status: "ARCHIVED" as Booking["status"],
        photoshootPackageHistory: undefined,
        originalPhotoshootPackage: undefined,
      }),
    ]);
    renderWithProviders(<CustomerBooking />);

    const unknown = await screen.findByText("Chưa xác định");
    expect(unknown).toHaveStyle({ color: "#6C757D" });
    expect(screen.getByText("Hoàn thành", { selector: "div" })).toBeInTheDocument();

    await userEvent.click(cardOf("Hoàn thành"));
    expect(navigate).toHaveBeenCalledWith("/profile/customer-booking/b4");
  });

  it("reports a booking without opening it", async () => {
    serveBookings();
    const { container } = renderWithProviders(<CustomerBooking />);
    await screen.findAllByText("Chụp ngoài trời");

    const reportIcon = container.querySelector<SVGElement>(
      'svg[class*="hover:opacity-80"]',
    );
    await userEvent.click(reportIcon as unknown as HTMLElement);

    expect(await screen.findByText("Cảnh báo")).toBeInTheDocument();
    expect(navigate).not.toHaveBeenCalled();
  });
});

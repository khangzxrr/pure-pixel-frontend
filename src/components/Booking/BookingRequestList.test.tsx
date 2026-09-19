import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse } from "msw";
import type { MockInstance } from "vitest";
import { renderWithProviders } from "../../test/render";
import { mockEndpoint } from "../../test/mockEndpoint";
import { buildBooking } from "./bookingTestData";
import BookingRequestList from "./BookingRequestList";

vi.mock("../../services/Keycloak", () => ({
  default: {
    isLoggedIn: () => false,
    getToken: () => undefined,
    getUserId: () => "photographer-1",
    hasRole: () => false,
  },
}));

const bookings = [
  buildBooking(),
  buildBooking({
    id: "booking-2",
    status: "ACCEPTED",
    photoshootPackageHistory: {
      title: "Gói kỷ yếu",
      subtitle: "",
      price: 900000,
      thumbnail: "",
      description: "",
    },
  }),
];

const mockBookings = (totalPage = 1) =>
  mockEndpoint("get", "*/photographer/booking/me", {
    objects: bookings,
    totalPage,
    totalRecord: bookings.length,
  });

describe("BookingRequestList", () => {
  let consoleError: MockInstance<typeof console.error>;

  beforeEach(() => {
    consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    const unexpected = consoleError.mock.calls
      .map(([message]) => String(message))
      // antd's Tooltip still calls findDOMNode for react-icons, which do not forward refs
      .filter((message) => !message.includes("findDOMNode is deprecated"));
    expect(unexpected).toEqual([]);
    consoleError.mockRestore();
  });

  it("loads the newest bookings of every status", async () => {
    const requests = mockBookings();
    const { container } = renderWithProviders(<BookingRequestList />);

    expect(screen.getByText("Đang tải...")).toBeInTheDocument();
    expect(await screen.findByText("Gói kỷ yếu")).toBeInTheDocument();
    expect(requests[0].query).toEqual({
      limit: "8",
      page: "0",
      orderByCreatedAt: "desc",
    });
    expect(screen.getByRole("button", { name: "Tất cả" })).toHaveStyle({
      backgroundColor: "#fff",
      color: "#FFC107",
    });
    expect(container.querySelector(".ant-pagination")).toBeNull();
  });

  it("filters by status and sorts oldest first", async () => {
    const requests = mockBookings();
    renderWithProviders(<BookingRequestList />);
    await screen.findByText("Gói kỷ yếu");

    await userEvent.click(screen.getByRole("button", { name: "Đang thực hiện" }));
    await waitFor(() => expect(requests.at(-1)?.query.status).toBe("ACCEPTED"));
    expect(requests.at(-1)?.query.page).toBe("0");
    expect(screen.getByRole("button", { name: "Đang thực hiện" })).toHaveStyle({
      backgroundColor: "#fff",
    });
    expect(screen.getByRole("button", { name: "Tất cả" })).toHaveStyle({
      backgroundColor: "#FFC107",
    });

    await userEvent.click(screen.getByRole("combobox"));
    await userEvent.click(await screen.findByTitle("Cũ nhất"));
    await waitFor(() =>
      expect(requests.at(-1)?.query.orderByCreatedAt).toBe("asc"),
    );
  });

  it("pages through the bookings", async () => {
    const requests = mockBookings(2);
    renderWithProviders(<BookingRequestList />);
    await screen.findByText("Gói kỷ yếu");

    await userEvent.click(screen.getByTitle("1"));
    expect(requests).toHaveLength(1);

    await userEvent.click(screen.getByTitle("2"));
    await waitFor(() => expect(requests).toHaveLength(2));
    expect(requests[1].query.page).toBe("1");
  });

  it("shows the empty state when nothing matches or loading fails", async () => {
    mockEndpoint("get", "*/photographer/booking/me", () =>
      HttpResponse.json({ message: "boom" }, { status: 500 }),
    );
    renderWithProviders(<BookingRequestList />);

    expect(
      await screen.findByText("Không có gói buổi chụp nào!"),
    ).toBeInTheDocument();
  });

  it("shows the empty state for an empty page", async () => {
    mockEndpoint("get", "*/photographer/booking/me", {
      objects: [],
      totalPage: 0,
      totalRecord: 0,
    });
    renderWithProviders(<BookingRequestList />);

    expect(
      await screen.findByText("Không có gói buổi chụp nào!"),
    ).toBeInTheDocument();
  });

  it("reports an accepted booking", async () => {
    mockBookings();
    const { container } = renderWithProviders(<BookingRequestList />);
    await screen.findByText("Gói kỷ yếu");

    await userEvent.click(
      container.querySelector('svg[class*="hover:opacity-80"]') as SVGElement,
    );

    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText("Cảnh báo")).toBeInTheDocument();

    await userEvent.click(within(dialog).getByRole("button", { name: "Close" }));
    await waitFor(() => expect(screen.queryByText("Cảnh báo")).toBeNull());
  });
});

import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import type { MockInstance } from "vitest";
import { renderWithProviders } from "../../../test/render";
import { mockEndpoint } from "../../../test/mockEndpoint";
import { server } from "../../../test/server";
import { FormatDateTime } from "../../../utils/FormatDateTimeUtils";
import { buildBooking } from "../bookingTestData";
import BookingCard, { type BookingItem } from "./BookingCard";

const navigate = vi.hoisted(() => vi.fn());

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-router-dom")>()),
  useNavigate: () => navigate,
}));

vi.mock("../../../services/Keycloak", () => ({
  default: {
    isLoggedIn: () => false,
    getToken: () => undefined,
    getUserId: () => "photographer-1",
    hasRole: () => false,
  },
}));

const renderCard = (
  overrides: Partial<BookingItem> = {},
  reportBooking = vi.fn(),
) => {
  const booking = buildBooking(overrides);
  return renderWithProviders(
    <BookingCard
      booking={booking}
      status={booking.status}
      reportBooking={reportBooking}
      textStateColor="text-yellow-500"
    />,
  );
};

const reportIcon = (container: HTMLElement) =>
  container.querySelector<SVGElement>('svg[class*="hover:opacity-80"]');

describe("BookingCard", () => {
  let consoleError: MockInstance<typeof console.error>;

  beforeEach(() => {
    consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    navigate.mockReset();
    const unexpected = consoleError.mock.calls
      .map(([message]) => String(message))
      // antd's Tooltip still calls findDOMNode for react-icons, which do not forward refs
      .filter((message) => !message.includes("findDOMNode is deprecated"));
    expect(unexpected).toEqual([]);
    consoleError.mockRestore();
  });

  it("shows a requested booking with accept and deny actions", async () => {
    const { container } = renderCard();

    expect(screen.getByText("Gói cưới")).toBeInTheDocument();
    expect(screen.getByText("Chờ xác nhận")).toHaveStyle({ color: "#FFA500" });
    expect(screen.getByText("1.500.000đ")).toBeInTheDocument();
    expect(screen.getByText("Khách Hàng")).toBeInTheDocument();
    expect(screen.getByText("Chụp ở hồ Gươm")).toBeInTheDocument();
    expect(
      screen.getByText(
        `${FormatDateTime("2026-09-20T02:00:00.000Z")} - ${FormatDateTime("2026-09-20T06:00:00.000Z")}`,
      ),
    ).toBeInTheDocument();
    expect(screen.getByText(/^Cập nhật/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Xác nhận" })).toBeInTheDocument();
    expect(reportIcon(container)).toBeNull();

    // a request cannot be opened yet
    await userEvent.click(screen.getByText("Gói cưới"));
    expect(navigate).not.toHaveBeenCalled();
  });

  it("accepts a request and opens the booking", async () => {
    const requests: string[] = [];
    let respond: () => void = () => {};
    server.use(
      http.post("*/photographer/booking/:id/accept", async ({ request }) => {
        requests.push(new URL(request.url).pathname);
        await new Promise<void>((resolve) => {
          respond = resolve;
        });
        return HttpResponse.json(buildBooking({ status: "ACCEPTED" }));
      }),
    );
    renderCard();

    await userEvent.click(screen.getByRole("button", { name: "Xác nhận" }));

    expect(
      await screen.findByText("Đang chấp nhận lịch hẹn này..."),
    ).toBeInTheDocument();
    respond();
    expect(
      await screen.findByText("Thành công", {
        selector: ".ant-notification-notice-message",
      }),
    ).toBeInTheDocument();
    expect(navigate).toHaveBeenCalledWith("/profile/booking-request/booking-1");
    expect(requests).toEqual(["/photographer/booking/booking-1/accept"]);
  });

  it("denies a request after confirmation, without sending a reason", async () => {
    const requests = mockEndpoint(
      "post",
      "*/photographer/booking/:id/deny",
      buildBooking({ status: "DENIED" }),
    );
    renderCard();

    // cancelling keeps the booking
    await userEvent.click(screen.getByRole("button", { name: "Từ chối" }));
    const confirm = await screen.findByRole("tooltip");
    await userEvent.click(within(confirm).getByRole("button", { name: "Hủy" }));
    expect(requests).toHaveLength(0);

    await userEvent.click(
      screen.getAllByRole("button", { name: "Từ chối" })[0],
    );
    await userEvent.click(
      within(await screen.findByRole("tooltip")).getByRole("button", {
        name: "Từ chối",
      }),
    );

    await waitFor(() => expect(requests).toHaveLength(1));
    expect(requests[0]).toMatchObject({
      method: "POST",
      path: "/photographer/booking/booking-1/deny",
      json: undefined,
    });
  });

  it("gives no feedback when the backend rejects the deny without a reason", async () => {
    const requests = mockEndpoint("post", "*/photographer/booking/:id/deny", () =>
      HttpResponse.json(
        { message: ["reason should not be empty"] },
        { status: 400 },
      ),
    );
    renderCard();

    await userEvent.click(screen.getByRole("button", { name: "Từ chối" }));
    await userEvent.click(
      within(await screen.findByRole("tooltip")).getByRole("button", {
        name: "Từ chối",
      }),
    );

    await waitFor(() => expect(requests).toHaveLength(1));
    // the request stays actionable and no notification explains the failure
    expect(screen.getByRole("button", { name: "Xác nhận" })).toBeInTheDocument();
    expect(document.querySelector(".ant-notification-notice")).toBeNull();
  });

  it("opens an accepted booking and reports it without opening", async () => {
    const reportBooking = vi.fn();
    const { container } = renderCard(
      { status: "ACCEPTED", description: "" },
      reportBooking,
    );

    expect(screen.getByText("Đang thực hiện")).toHaveStyle({ color: "#007BFF" });
    expect(screen.getByText("Không có")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Xác nhận" })).toBeNull();

    await userEvent.click(reportIcon(container) as SVGElement);
    expect(reportBooking).toHaveBeenCalledWith("booking-1");
    expect(navigate).not.toHaveBeenCalled();

    await userEvent.click(screen.getByText("Gói cưới"));
    expect(navigate).toHaveBeenCalledWith("/profile/booking-request/booking-1");
  });

  it("opens a finished booking", async () => {
    renderCard({ status: "SUCCESSED" });

    expect(screen.getByText("Hoàn thành")).toBeInTheDocument();
    await userEvent.click(screen.getByText("Gói cưới"));
    expect(navigate).toHaveBeenCalledWith("/profile/booking-request/booking-1");
  });

  it.each([
    ["DENIED", "Từ chối", "#DC3545"],
    ["FAILED", "Đã huỷ", "#6C757D"],
  ] as const)("shows a %s booking without actions", async (status, label, color) => {
    renderCard({ status });

    expect(screen.getByText(label)).toHaveStyle({ color });
    expect(screen.queryByRole("button")).toBeNull();
    await userEvent.click(screen.getByText("Gói cưới"));
    expect(navigate).not.toHaveBeenCalled();
  });

  it("labels an unknown status", () => {
    const booking = buildBooking();
    renderWithProviders(
      <BookingCard booking={booking} status="ARCHIVED" reportBooking={vi.fn()} />,
    );

    expect(screen.getByText("Chưa xác định")).toHaveStyle({ color: "#6C757D" });
  });
});

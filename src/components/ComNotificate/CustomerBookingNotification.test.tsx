import { Route, Routes } from "react-router-dom";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CustomerBookingNotification from "./CustomerBookingNotification";
import { renderWithProviders } from "../../test/render";
import { mockEndpoint } from "../../test/mockEndpoint";
import type { Schema } from "../../apis/types";

vi.mock("../../services/Keycloak", () => ({
  default: {
    isLoggedIn: () => false,
    getToken: () => undefined,
    updateToken: vi.fn().mockResolvedValue(true),
    forceRefreshToken: vi.fn().mockResolvedValue(false),
  },
}));

const FALLBACK_AVATAR =
  "https://vnn-imgs-a1.vgcloud.vn/image1.ictnews.vn/_Files/2020/03/17/trend-avatar-1.jpg";

const makeNotification = (
  overrides: Partial<Schema<"NotificationDto">> = {},
): Schema<"NotificationDto"> => ({
  id: "noti-1",
  title: "Thông báo",
  content: "Bạn có thông báo lịch chụp",
  status: "SHOW",
  type: "IN_APP",
  referenceType: "CUSTOMER_BOOKING_REQUEST",
  payload: { id: "booking-1" },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

const renderNotification = (
  notification: Schema<"NotificationDto">,
  onClose = vi.fn(),
) => {
  const view = renderWithProviders(
    <Routes>
      <Route
        path="/"
        element={
          <CustomerBookingNotification
            notification={notification}
            onClose={onClose}
          />
        }
      />
      <Route
        path="/profile/customer-booking"
        element={<div>customer-booking-page</div>}
      />
      <Route
        path="/profile/customer-booking/:id"
        element={<div>customer-booking-detail-page</div>}
      />
    </Routes>,
  );

  return { ...view, onClose };
};

describe("CustomerBookingNotification", () => {
  it("renders fetched thumbnail and navigates to the booking list", async () => {
    mockEndpoint("get", "*/customer/booking/:id", {
      photoshootPackageHistory: { thumbnail: "https://img.test/customer-booking.jpg" },
    });
    const notification = makeNotification({
      referenceType: "CUSTOMER_BOOKING_REQUEST",
      content: "Yêu cầu đặt lịch mới",
    });
    const { onClose, container } = renderNotification(notification);

    expect(await screen.findByText("Yêu cầu đặt lịch mới")).toBeInTheDocument();
    await waitFor(() =>
      expect(container.querySelector("img")).toHaveAttribute(
        "src",
        "https://img.test/customer-booking.jpg",
      ),
    );

    await userEvent.click(screen.getByText("Yêu cầu đặt lịch mới"));

    expect(await screen.findByText("customer-booking-page")).toBeInTheDocument();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("falls back to the default avatar and navigates to the booking detail", async () => {
    mockEndpoint("get", "*/customer/booking/:id", {
      photoshootPackageHistory: {},
    });
    const notification = makeNotification({
      referenceType: "CUSTOMER_BOOKING_PAID",
      content: "Đơn đặt lịch đã thanh toán",
      payload: { id: "booking-99" },
    });
    const { onClose, container } = renderNotification(notification);

    expect(await screen.findByText("Đơn đặt lịch đã thanh toán")).toBeInTheDocument();
    await waitFor(() =>
      expect(container.querySelector("img")).toHaveAttribute("src", FALLBACK_AVATAR),
    );

    await userEvent.click(screen.getByText("Đơn đặt lịch đã thanh toán"));

    expect(
      await screen.findByText("customer-booking-detail-page"),
    ).toBeInTheDocument();
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

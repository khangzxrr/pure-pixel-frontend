import { Route, Routes } from "react-router-dom";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PhotographerBookingNotification from "./PhotographerBookingNotification";
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
  id: "noti-ptg-1",
  title: "Thông báo",
  content: "Thông báo lịch chụp nhiếp ảnh gia",
  status: "SHOW",
  type: "IN_APP",
  referenceType: "PHOTOGRAPHER_BOOKING_NEW_REQUEST",
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
          <PhotographerBookingNotification
            notification={notification}
            onClose={onClose}
          />
        }
      />
      <Route path="/profile/booking-request" element={<div>booking-request-page</div>} />
      <Route
        path="/profile/booking-request/:id"
        element={<div>booking-request-detail-page</div>}
      />
    </Routes>,
  );

  return { ...view, onClose };
};

describe("PhotographerBookingNotification", () => {
  it("renders fetched thumbnail and navigates to the booking-request page", async () => {
    mockEndpoint("get", "*/photographer/booking/:id", {
      photoshootPackageHistory: { thumbnail: "https://img.test/photographer-booking.jpg" },
    });
    const notification = makeNotification({
      content: "Bạn có yêu cầu đặt lịch mới",
      referenceType: "PHOTOGRAPHER_BOOKING_NEW_REQUEST",
    });
    const { onClose, container } = renderNotification(notification);

    expect(await screen.findByText("Bạn có yêu cầu đặt lịch mới")).toBeInTheDocument();
    await waitFor(() =>
      expect(container.querySelector("img")).toHaveAttribute(
        "src",
        "https://img.test/photographer-booking.jpg",
      ),
    );

    await userEvent.click(screen.getByText("Bạn có yêu cầu đặt lịch mới"));

    expect(await screen.findByText("booking-request-page")).toBeInTheDocument();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("falls back to the default avatar and navigates to the booking-review detail", async () => {
    mockEndpoint("get", "*/photographer/booking/:id", {
      photoshootPackageHistory: {},
    });
    const notification = makeNotification({
      referenceType: "PHOTOGRAPHER_NEW_BOOKING_REVIEW",
      content: "Bạn vừa nhận được đánh giá mới",
      payload: { id: "booking-55" },
    });
    const { onClose, container } = renderNotification(notification);

    expect(await screen.findByText("Bạn vừa nhận được đánh giá mới")).toBeInTheDocument();
    await waitFor(() =>
      expect(container.querySelector("img")).toHaveAttribute("src", FALLBACK_AVATAR),
    );

    await userEvent.click(screen.getByText("Bạn vừa nhận được đánh giá mới"));

    expect(
      await screen.findByText("booking-request-detail-page"),
    ).toBeInTheDocument();
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

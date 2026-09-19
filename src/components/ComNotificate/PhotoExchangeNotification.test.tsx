import { Route, Routes } from "react-router-dom";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse } from "msw";
import PhotoExchangeNotification from "./PhotoExchangeNotification";
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
  id: "photo-exchange-1",
  title: "Thông báo",
  content: "Thông báo giao dịch ảnh",
  status: "SHOW",
  type: "IN_APP",
  referenceType: "CUSTOMER_PHOTO_BUY",
  payload: { id: "photo-1" },
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
        element={<PhotoExchangeNotification notification={notification} onClose={onClose} />}
      />
      <Route path="/profile/wallet" element={<div>wallet-page</div>} />
      <Route path="/profile/photo-bought/:id" element={<div>photo-bought-page</div>} />
    </Routes>,
  );

  return { ...view, onClose };
};

describe("PhotoExchangeNotification", () => {
  it("renders the bought photo preview and navigates to the bought-photo page", async () => {
    mockEndpoint("get", "*/photo/:id/photo-buy", {
      photoBuys: [{ previewUrl: "https://img.test/bought-preview.jpg" }],
      photo: { signedUrl: { thumbnail: "https://img.test/photo-thumb.jpg" } },
    });
    const notification = makeNotification({
      content: "Bạn vừa mua một bức ảnh",
      referenceType: "CUSTOMER_PHOTO_BUY",
    });
    const { onClose, container } = renderNotification(notification);

    expect(await screen.findByText("Bạn vừa mua một bức ảnh")).toBeInTheDocument();
    await waitFor(() =>
      expect(container.querySelector("img")).toHaveAttribute(
        "src",
        "https://img.test/bought-preview.jpg",
      ),
    );

    await userEvent.click(screen.getByText("Bạn vừa mua một bức ảnh"));

    expect(await screen.findByText("photo-bought-page")).toBeInTheDocument();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("falls back to the default avatar and navigates to the wallet page", async () => {
    mockEndpoint("get", "*/photo/:id/photo-buy", {
      photoBuys: [],
      photo: { signedUrl: {} },
    });
    const notification = makeNotification({
      content: "Giá ảnh vừa được cập nhật",
      referenceType: "PHOTOGRAPHER_PHOTO_SELL",
    });
    const { onClose, container } = renderNotification(notification);

    expect(await screen.findByText("Giá ảnh vừa được cập nhật")).toBeInTheDocument();
    await waitFor(() =>
      expect(container.querySelector("img")).toHaveAttribute("src", FALLBACK_AVATAR),
    );

    await userEvent.click(screen.getByText("Giá ảnh vừa được cập nhật"));

    expect(await screen.findByText("wallet-page")).toBeInTheDocument();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("renders nothing when the detail request fails", async () => {
    mockEndpoint("get", "*/photo/:id/photo-buy", () =>
      HttpResponse.json({}, { status: 500 }),
    );

    const { container } = renderNotification(makeNotification({ content: "Lỗi giao dịch ảnh" }));

    await waitFor(() => expect(container.textContent).toBe(""));
  });
});

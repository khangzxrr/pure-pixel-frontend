import { Route, Routes } from "react-router-dom";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse } from "msw";
import PhotoNotification from "./PhotoNotification";
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
  id: "photo-noti-1",
  title: "Thông báo",
  content: "Thông báo ảnh",
  status: "SHOW",
  type: "IN_APP",
  referenceType: "PHOTO_COMMENT",
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
        element={<PhotoNotification notification={notification} onClose={onClose} />}
      />
      <Route path="/profile/my-photos" element={<div>my-photos-page</div>} />
      <Route path="/photo/:id" element={<div>photo-detail-page</div>} />
      <Route
        path="/explore/product-photo/:id"
        element={<div>product-photo-page</div>}
      />
    </Routes>,
  );

  return { ...view, onClose };
};

describe("PhotoNotification", () => {
  it("falls back to the default avatar and highlights banned photo notifications", async () => {
    mockEndpoint("get", "*/photo/:id", {
      signedUrl: {},
      photoSellings: [{ active: false }],
    });
    const notification = makeNotification({
      content: "Ảnh của bạn đã bị cấm",
      referenceType: "PHOTO_BAN",
    });
    const { onClose, container } = renderNotification(notification);

    const content = await screen.findByText("Ảnh của bạn đã bị cấm");
    await waitFor(() =>
      expect(container.querySelector("img")).toHaveAttribute("src", FALLBACK_AVATAR),
    );
    expect(content).toHaveClass("text-red-500");

    await userEvent.click(content);

    expect(await screen.findByText("my-photos-page")).toBeInTheDocument();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("renders the thumbnail and navigates to the public photo detail for normal comments", async () => {
    mockEndpoint("get", "*/photo/:id", {
      signedUrl: { thumbnail: "https://img.test/photo-detail.jpg" },
      photoSellings: [{ active: false }],
    });
    const notification = makeNotification({
      content: "Ảnh của bạn vừa có bình luận",
      referenceType: "PHOTO_COMMENT",
    });
    const { onClose, container } = renderNotification(notification);

    expect(await screen.findByText("Ảnh của bạn vừa có bình luận")).toBeInTheDocument();
    await waitFor(() =>
      expect(container.querySelector("img")).toHaveAttribute(
        "src",
        "https://img.test/photo-detail.jpg",
      ),
    );

    await userEvent.click(screen.getByText("Ảnh của bạn vừa có bình luận"));

    expect(await screen.findByText("photo-detail-page")).toBeInTheDocument();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("routes comment notifications for selling photos to the product detail page", async () => {
    mockEndpoint("get", "*/photo/:id", {
      signedUrl: { thumbnail: "https://img.test/product-photo.jpg" },
      photoSellings: [{ active: true }],
    });
    const notification = makeNotification({
      content: "Ảnh đang bán vừa có bình luận",
      referenceType: "PHOTO_COMMENT",
    });
    const { onClose } = renderNotification(notification);

    await userEvent.click(await screen.findByText("Ảnh đang bán vừa có bình luận"));

    expect(await screen.findByText("product-photo-page")).toBeInTheDocument();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("renders nothing when loading the photo detail fails", async () => {
    mockEndpoint("get", "*/photo/:id", () =>
      HttpResponse.json({}, { status: 500 }),
    );

    const { container } = renderNotification(makeNotification({ content: "Lỗi ảnh" }));

    await waitFor(() => expect(container.textContent).toBe(""));
  });
});

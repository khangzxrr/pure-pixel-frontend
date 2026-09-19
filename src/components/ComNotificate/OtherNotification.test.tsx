import { Route, Routes, useLocation } from "react-router-dom";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import OtherNotification from "./OtherNotification";
import { renderWithProviders } from "../../test/render";
import type { Schema } from "../../apis/types";

const makeNotification = (
  overrides: Partial<Schema<"NotificationDto">> = {},
): Schema<"NotificationDto"> => ({
  id: "other-1",
  title: "Thông báo",
  content: "Thông báo khác",
  status: "SHOW",
  type: "IN_APP",
  referenceType: "BAN",
  payload: { id: "receiver-1" },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

const MessageLocation = () => {
  const location = useLocation();
  return <div>{location.pathname + location.search}</div>;
};

const renderNotification = (
  notification: Schema<"NotificationDto">,
  route = "/start",
  onClose = vi.fn(),
) =>
  renderWithProviders(
    <Routes>
      <Route
        path="/start"
        element={<OtherNotification notification={notification} onClose={onClose} />}
      />
      <Route path="/" element={<div>home-page</div>} />
      <Route path="/profile/userprofile" element={<div>user-profile-page</div>} />
      <Route path="/profile/wallet" element={<div>wallet-page</div>} />
      <Route path="/message" element={<MessageLocation />} />
    </Routes>,
    { route },
  );

describe("OtherNotification", () => {
  it("navigates banned users back home", async () => {
    const onClose = vi.fn();
    renderNotification(makeNotification({ content: "Bạn đã bị cấm", referenceType: "BAN" }), "/start", onClose);

    await userEvent.click(screen.getByText("Bạn đã bị cấm"));

    expect(await screen.findByText("home-page")).toBeInTheDocument();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("navigates chat notifications with the receiver query string", async () => {
    const onClose = vi.fn();
    renderNotification(
      makeNotification({
        content: "Bạn có tin nhắn mới",
        referenceType: "CHAT",
        payload: { id: "user-99" },
      }),
      "/start",
      onClose,
    );

    await userEvent.click(screen.getByText("Bạn có tin nhắn mới"));

    expect(await screen.findByText("/message?to=user-99")).toBeInTheDocument();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("navigates upgrade notifications to the profile page", async () => {
    const onClose = vi.fn();
    renderNotification(
      makeNotification({
        content: "Gói nâng cấp vừa được kích hoạt",
        referenceType: "UPGRADE_PACKAGE",
      }),
      "/start",
      onClose,
    );

    await userEvent.click(screen.getByText("Gói nâng cấp vừa được kích hoạt"));
    expect(await screen.findByText("user-profile-page")).toBeInTheDocument();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("navigates successful withdrawals to the wallet page", async () => {
    const onClose = vi.fn();
    renderNotification(
      makeNotification({
        content: "Rút tiền thành công",
        referenceType: "SUCCESS_WITHDRAWAL",
      }),
      "/start",
      onClose,
    );

    await userEvent.click(screen.getByText("Rút tiền thành công"));
    expect(await screen.findByText("wallet-page")).toBeInTheDocument();
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

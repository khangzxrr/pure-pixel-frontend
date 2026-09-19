import { Route, Routes } from "react-router-dom";
import { act, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import NotificationModal from "./NotificationModal";
import { renderWithProviders } from "../../test/render";
import { mockEndpoint } from "../../test/mockEndpoint";
import { server } from "../../test/server";
import useNotificationStore from "../../states/UseNotificationStore";
import UseSidebarStore from "../../states/UseSidebarStore";
import type { Schema } from "../../apis/types";

vi.mock("../../services/Keycloak", () => ({
  default: {
    isLoggedIn: () => false,
    getToken: () => undefined,
    updateToken: vi.fn().mockResolvedValue(true),
    forceRefreshToken: vi.fn().mockResolvedValue(false),
  },
}));

const auth = vi.hoisted(() => ({ keycloak: null as Awaited<ReturnType<typeof import("../../test/keycloak")["createKeycloakMock"]>> | null }));

vi.mock("@react-keycloak/web", async () => {
  const { createKeycloakMock } = await import("../../test/keycloak");
  return {
    useKeycloak: () => ({
      keycloak: auth.keycloak ?? createKeycloakMock({ authenticated: false }),
      initialized: true,
    }),
  };
});

const defaultNotificationState = useNotificationStore.getState();

const makeNotification = (
  overrides: Partial<Schema<"NotificationDto">> = {},
): Schema<"NotificationDto"> => ({
  id: crypto.randomUUID(),
  title: "Thông báo",
  content: "Nội dung thông báo",
  status: "SHOW",
  type: "IN_APP",
  referenceType: "BAN",
  payload: { id: "payload-1" },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

const renderModal = (isOpen = true, onClose = vi.fn()) =>
  renderWithProviders(
    <Routes>
      <Route path="/" element={<NotificationModal isOpen={isOpen} onClose={onClose} />} />
      <Route path="*" element={<div>route-target</div>} />
    </Routes>,
  );

describe("NotificationModal", () => {
  beforeEach(async () => {
    const { createKeycloakMock } = await import("../../test/keycloak");
    auth.keycloak = createKeycloakMock({ authenticated: false });
    useNotificationStore.setState({
      ...defaultNotificationState,
      socket: null,
      isNewNotification: false,
      isNotificationOpen: false,
      initSocket: defaultNotificationState.initSocket,
      setIsNotification: defaultNotificationState.setIsNotification,
    });
    UseSidebarStore.setState({ isSidebarOpen: false, activeLink: null });
  });

  afterEach(() => {
    useNotificationStore.setState(defaultNotificationState);
  });

  it("does not render when closed", () => {
    mockEndpoint("get", "*/notification", {
      objects: [],
      totalPage: 1,
      totalRecord: 0,
    });
    renderModal(false);

    expect(screen.queryByText("Thông báo")).toBeNull();
  });

  it("renders photographer and photo-exchange notifications and closes through child actions", async () => {
    mockEndpoint("get", "*/notification", {
      objects: [
        makeNotification({
          id: "n4",
          content: "Nhiếp ảnh gia có yêu cầu mới",
          referenceType: "PHOTOGRAPHER_BOOKING_NEW_REQUEST",
          payload: { id: "booking-ptg" },
        }),
        makeNotification({
          id: "n5",
          content: "Bạn vừa bán một bức ảnh",
          referenceType: "CUSTOMER_PHOTO_BUY",
          payload: { id: "photo-bought-1" },
        }),
      ],
      totalPage: 1,
      totalRecord: 2,
    });
    mockEndpoint("get", "*/photographer/booking/:id", {
      photoshootPackageHistory: { thumbnail: "https://img.test/ptg-booking.jpg" },
    });
    mockEndpoint("get", "*/photo/:id/photo-buy", {
      photoBuys: [{ previewUrl: "https://img.test/bought.jpg" }],
      photo: { signedUrl: { thumbnail: "https://img.test/bought-thumb.jpg" } },
    });
    const onClose = vi.fn();

    renderModal(true, onClose);

    expect(await screen.findByText("Nhiếp ảnh gia có yêu cầu mới")).toBeInTheDocument();
    expect(screen.getByText("Bạn vừa bán một bức ảnh")).toBeInTheDocument();

    await userEvent.click(screen.getByText("Nhiếp ảnh gia có yêu cầu mới"));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(UseSidebarStore.getState().isSidebarOpen).toBe(true);
  });

  it("initializes the socket and handles BAN notification events", async () => {
    const { createKeycloakMock } = await import("../../test/keycloak");
    auth.keycloak = createKeycloakMock({ authenticated: true });
    const handlers: Record<string, (data: { title: string; content: string; referenceType: string }) => Promise<void>> = {};
    const socket = {
      on: vi.fn((event: string, handler: (data: { title: string; content: string; referenceType: string }) => Promise<void>) => {
        handlers[event] = handler;
      }),
      off: vi.fn(),
    };
    const initSocket = vi.fn();
    const setIsNotification = vi.fn();
    mockEndpoint("get", "*/notification", {
      objects: [],
      totalPage: 1,
      totalRecord: 0,
    });

    useNotificationStore.setState({
      ...defaultNotificationState,
      socket: socket as never,
      initSocket,
      setIsNotification,
    });
    const { queryClient, unmount } = renderModal(true);

    queryClient.setQueryData(["get-all-customer-bookings"], []);
    queryClient.setQueryData(["customer-booking-detail"], {});
    queryClient.setQueryData(["customer-booking-bill-items"], []);
    queryClient.setQueryData(["get-all-photographer-booking"], []);
    queryClient.setQueryData(["photographer-booking-detail"], {});
    queryClient.setQueryData(["getTransactionById"], {});

    await screen.findByText("Thông báo");
    await waitFor(() => expect(initSocket).toHaveBeenCalledWith(auth.keycloak?.token));
    await waitFor(() => expect(socket.on).toHaveBeenCalledWith("notification-event", expect.any(Function)));

    await act(async () => {
      await handlers["notification-event"]({
        title: "Ban",
        content: "Tài khoản đã bị cấm",
        referenceType: "BAN",
      });
    });

    expect(setIsNotification).toHaveBeenCalledWith(true);
    expect(auth.keycloak?.logout).toHaveBeenCalledTimes(1);
    await waitFor(() =>
      expect(
        queryClient.getQueryState(["get-all-customer-bookings"])?.isInvalidated,
      ).toBe(true),
    );
    expect(
      await screen.findByText("Tài khoản đã bị cấm", {
        selector: ".ant-notification-notice-description",
      }),
    ).toBeInTheDocument();

    unmount();
    expect(socket.off).toHaveBeenCalledWith("notification-event", expect.any(Function));
  });

  it("shows a loading spinner first and then renders multiple notification types", async () => {
    server.use(
      http.get("*/notification", async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
        return HttpResponse.json({
          objects: [
            makeNotification({
              id: "n1",
              content: "Khách hàng vừa đặt lịch",
              referenceType: "CUSTOMER_BOOKING_REQUEST",
              payload: { id: "booking-1" },
            }),
            makeNotification({
              id: "n2",
              content: "Ảnh vừa có bình luận mới",
              referenceType: "PHOTO_COMMENT",
              payload: { id: "photo-1" },
            }),
            makeNotification({
              id: "n3",
              content: "Tài khoản của bạn có cảnh báo",
              referenceType: "BAN",
              payload: { id: "admin" },
            }),
          ],
          totalPage: 1,
          totalRecord: 3,
        });
      }),
    );
    mockEndpoint("get", "*/customer/booking/:id", {
      photoshootPackageHistory: { thumbnail: "https://img.test/booking.jpg" },
    });
    mockEndpoint("get", "*/photo/:id", {
      signedUrl: { thumbnail: "https://img.test/photo.jpg" },
      photoSellings: [{ active: false }],
    });

    const { container } = renderModal(true);

    expect(await screen.findByText("Thông báo")).toBeInTheDocument();
    expect(container.querySelector(".ant-spin-spinning")).toBeInTheDocument();

    expect(await screen.findByText("Khách hàng vừa đặt lịch")).toBeInTheDocument();
    expect(screen.getByText("Ảnh vừa có bình luận mới")).toBeInTheDocument();
    expect(screen.getByText("Tài khoản của bạn có cảnh báo")).toBeInTheDocument();
    await waitFor(() => {
      const sources = Array.from(container.querySelectorAll("img")).map((img) =>
        img.getAttribute("src"),
      );
      expect(sources).toContain("https://img.test/booking.jpg");
      expect(sources).toContain("https://img.test/photo.jpg");
    });
  });

  it("closes when the overlay is clicked", async () => {
    mockEndpoint("get", "*/notification", {
      objects: [],
      totalPage: 1,
      totalRecord: 0,
    });
    const onClose = vi.fn();
    const { container } = renderModal(true, onClose);

    await screen.findByText("Thông báo");
    const overlay = container.querySelector("#modal-overlay");
    expect(overlay).not.toBeNull();

    await userEvent.click(overlay!);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("renders the error message when loading notifications fails", async () => {
    mockEndpoint("get", "*/notification", () =>
      HttpResponse.json({}, { status: 500 }),
    );

    renderModal(true);

    expect(
      await screen.findByText("Có gì đó đã sai, vui lòng thử lại"),
    ).toBeInTheDocument();
  });
});

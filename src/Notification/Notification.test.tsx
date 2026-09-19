import { render, renderHook, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { notification } from "antd";
import type { NotificationInstance } from "antd/es/notification/interface";
import type { ReactNode } from "react";
import { NotificationProvider, useNotification } from "./Notification";

const wrapper = ({ children }: { children: ReactNode }) => (
  <NotificationProvider>{children}</NotificationProvider>
);

describe("NotificationProvider", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  const mockAntd = () => {
    const api = {
      success: vi.fn(),
      info: vi.fn(),
      warning: vi.fn(),
      error: vi.fn(),
    };
    vi.spyOn(notification, "useNotification").mockReturnValue([
      api as unknown as NotificationInstance,
      <></>,
    ]);
    return api;
  };

  it("capitalizes text and applies the defaults", () => {
    const api = mockAntd();
    const { result } = renderHook(() => useNotification(), { wrapper });

    result.current.notificationApi("success", "  saved ", " all good");

    expect(api.success).toHaveBeenCalledWith({
      message: "Saved",
      description: "All good",
      icon: "",
      key: "",
      duration: 3,
    });
  });

  it("passes elements, icon, key and duration through", () => {
    const api = mockAntd();
    const { result } = renderHook(() => useNotification(), { wrapper });
    const message = <b>bold</b>;
    const icon = <i>icon</i>;

    result.current.notificationApi("error", message, undefined, icon, 8, "k1");

    expect(api.error).toHaveBeenCalledWith({
      message,
      description: undefined,
      icon,
      key: "k1",
      duration: 8,
    });
  });

  it("keeps an unlimited notification open", () => {
    const api = mockAntd();
    const { result } = renderHook(() => useNotification(), { wrapper });

    result.current.notificationApi("info", "x", "y", null, "unlimit");

    expect(api.info).toHaveBeenCalledWith(
      expect.objectContaining({ duration: 0 }),
    );
  });

  it("renders a real notification", async () => {
    function Trigger() {
      const { notificationApi } = useNotification();
      return (
        <button onClick={() => notificationApi("success", "đã lưu")}>
          go
        </button>
      );
    }
    render(<Trigger />, { wrapper });

    await userEvent.click(screen.getByText("go"));

    expect(await screen.findByText("Đã lưu")).toBeInTheDocument();
  });

  it("exports the latest api for code outside components", async () => {
    mockAntd();
    renderHook(() => useNotification(), { wrapper });
    const module = await import("./Notification");
    expect(module.notificationApi).toBeTypeOf("function");
  });

  it("throws when used outside the provider", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    expect(() => renderHook(() => useNotification())).toThrow(
      "useNotification must be used inside NotificationProvider",
    );
  });
});

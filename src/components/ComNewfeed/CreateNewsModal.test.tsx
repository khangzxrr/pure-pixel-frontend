import { fireEvent, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { KeycloakTokenParsed } from "keycloak-js";
import { act } from "react";
import { renderWithProviders } from "../../test/render";
import { mockEndpoint } from "../../test/mockEndpoint";
import CreateNewsModal from "./CreateNewsModal";

vi.mock("../../services/Keycloak", () => ({
  default: { isLoggedIn: () => false, getToken: () => undefined },
}));

const userInfo = {
  name: "Khang",
} as KeycloakTokenParsed;

describe("CreateNewsModal", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("loads the profile, lets the user switch to photo mode, and shows the privacy options", async () => {
    mockEndpoint("get", "*/me", {
      id: "me-1",
      avatar: "avatar.png",
      name: "Khang",
    });

    const { container } = renderWithProviders(
      <CreateNewsModal onClose={vi.fn()} userInfo={userInfo} />,
    );

    expect(await screen.findByText("Tạo bài viết")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Khang, bạn đang nghĩ gì?")).toBeInTheDocument();
    await waitFor(() =>
      expect(container.querySelector("img")?.getAttribute("src")).toBe(
        "avatar.png",
      ),
    );

    await userEvent.click(screen.getByRole("button", { name: /chỉ mình tôi/i }));
    expect(await screen.findByText("Công khai")).toBeInTheDocument();
    expect(screen.getAllByText("Chỉ mình tôi")).toHaveLength(2);

    fireEvent.click(container.querySelector(".text-green-400") as SVGElement);
    expect(await screen.findByText("Thêm ảnh")).toBeInTheDocument();
    expect(screen.getByText("Kéo và thả ảnh vào đây")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Quay lại" }));
    expect(await screen.findByText("Tạo bài viết")).toBeInTheDocument();
  });

  it("closes from the backdrop after the exit animation", async () => {
    mockEndpoint("get", "*/me", {
      id: "me-1",
      avatar: "avatar.png",
      name: "Khang",
    });
    const onClose = vi.fn();
    const { container } = renderWithProviders(
      <CreateNewsModal onClose={onClose} userInfo={userInfo} />,
    );

    await screen.findByText("Tạo bài viết");
    vi.useFakeTimers();
    fireEvent.click(screen.getByPlaceholderText("Khang, bạn đang nghĩ gì?"));
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(onClose).not.toHaveBeenCalled();

    fireEvent.click(container.firstElementChild as HTMLElement);
    act(() => {
      vi.advanceTimersByTime(299);
    });
    expect(onClose).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("closes from the close button after the exit animation", async () => {
    mockEndpoint("get", "*/me", {
      id: "me-1",
      avatar: "avatar.png",
      name: "Khang",
    });
    const onClose = vi.fn();
    const { container } = renderWithProviders(
      <CreateNewsModal onClose={onClose} userInfo={userInfo} />,
    );

    await screen.findByText("Tạo bài viết");
    vi.useFakeTimers();
    fireEvent.click(container.querySelector("button.absolute") as HTMLButtonElement);
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

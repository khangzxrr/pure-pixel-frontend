import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import type { MockInstance } from "vitest";
import { renderWithProviders } from "../../test/render";
import { server } from "../../test/server";
import { mockEndpoint } from "../../test/mockEndpoint";
import UserProfileV2 from "./UserProfileV2";

const navigate = vi.hoisted(() => vi.fn());
const auth = vi.hoisted(() => ({ authenticated: true, sub: "me-1" }));

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-router-dom")>()),
  useNavigate: () => navigate,
}));

vi.mock("@react-keycloak/web", async () => {
  const { createKeycloakMock } = await import("../../test/keycloak");
  return {
    useKeycloak: () => ({
      keycloak: createKeycloakMock({
        authenticated: auth.authenticated,
        sub: auth.sub,
        roles: ["customer"],
      }),
      initialized: true,
    }),
  };
});

vi.mock("../../services/Keycloak", () => ({
  default: { isLoggedIn: () => false, getToken: () => undefined },
}));

const PROFILE_URL = "*/photographer/:id/profile";
const LOGIN_WARNING = "Bạn cần đăng nhập tài khoản để sử dụng được tính năng này";

const profile = {
  photographer: {
    id: "ptg-1",
    name: "Nhiếp Ảnh",
    avatar: "https://cdn.test/avatar.jpg",
    cover: "https://cdn.test/cover.jpg",
    quote: "Chụp bằng cả trái tim",
    isFollowed: true,
    _count: { followers: 10, followings: 3, photos: 42 },
  },
  followersCount: 10,
  followingsCount: 3,
  upvoteCount: 0,
  commentCount: 0,
};

const renderProfile = (userId = "ptg-1") =>
  renderWithProviders(<UserProfileV2 />, {
    route: `/user/${userId}`,
    path: "/user/:userId",
  });

const hoverLabel = () => document.querySelector(".bg-gray-700")?.textContent;

describe("UserProfileV2", () => {
  let consoleError: MockInstance<typeof console.error>;

  beforeEach(() => {
    consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    auth.authenticated = true;
    auth.sub = "me-1";
    navigate.mockReset();
  });

  afterEach(() => {
    // FollowButton and this page still pass antd's deprecated Modal `visible`
    const unexpected = consoleError.mock.calls
      .map((args) => args.map(String).join(" "))
      .filter((message) => !message.includes("deprecated"));
    consoleError.mockRestore();
    expect(unexpected.join("\n")).toBe("");
  });

  it("shows the photographer header", async () => {
    const requests = mockEndpoint("get", PROFILE_URL, profile);

    const { container } = renderProfile();

    expect(screen.getByText("Loading...")).toBeInTheDocument();
    expect(await screen.findByText("Nhiếp Ảnh")).toBeInTheDocument();
    expect(screen.getByText('"Chụp bằng cả trái tim"')).toBeInTheDocument();
    expect(
      Array.from(container.querySelectorAll("img")).map((img) => img.src),
    ).toEqual([profile.photographer.cover, profile.photographer.avatar]);
    expect(container.querySelector(".lucide-user")?.parentElement).toHaveTextContent("10");
    expect(container.querySelector(".lucide-user-check")?.parentElement).toHaveTextContent("3");
    expect(container.querySelector(".lucide-image")?.parentElement).toHaveTextContent("42");
    expect(screen.getByRole("button", { name: "Đang theo dõi" })).toBeInTheDocument();
    expect(requests[0].path).toMatch(/\/photographer\/ptg-1\/profile$/);
    expect(navigate).not.toHaveBeenCalled();
  });

  it("labels each icon on hover", async () => {
    mockEndpoint("get", PROFILE_URL, profile);
    const { container } = renderProfile();
    await screen.findByText("Nhiếp Ảnh");

    const icons: Array<[string, string]> = [
      [".lucide-user", "Theo dõi"],
      [".lucide-user-check", "Đang theo dõi"],
      [".lucide-image", "Tổng ảnh"],
      ["svg.text-3xl", "Báo cáo"],
      [".lucide-share2, .lucide-share-2", "Chia sẻ"],
      [".lucide-message-circle", "Nhắn tin"],
    ];
    for (const [selector, label] of icons) {
      const target = container.querySelector(selector)?.parentElement as HTMLElement;
      await userEvent.hover(target);
      expect(hoverLabel()).toBe(label);
      await userEvent.unhover(target);
      expect(hoverLabel()).toBeUndefined();
    }
  });

  it("lets signed-in users message and report the photographer", async () => {
    mockEndpoint("get", PROFILE_URL, profile);
    const { container } = renderProfile();
    await screen.findByText("Nhiếp Ảnh");

    await userEvent.click(container.querySelector(".lucide-message-circle") as Element);
    expect(navigate).toHaveBeenCalledWith("/message?to=ptg-1");

    await userEvent.click(container.querySelector("svg.text-3xl") as Element);
    expect(screen.getByText("Báo cáo người dùng")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Back" }));
    expect(screen.queryByText("Báo cáo người dùng")).toBeNull();
  });

  it("asks guests to sign in before messaging or reporting", async () => {
    auth.authenticated = false;
    mockEndpoint("get", PROFILE_URL, { ...profile, photographer: { ...profile.photographer, quote: "" } });
    const { container } = renderProfile();
    await screen.findByText("Nhiếp Ảnh");
    expect(screen.queryByText(/Chụp bằng cả trái tim/)).toBeNull();

    await userEvent.click(container.querySelector(".lucide-message-circle") as Element);
    expect(await screen.findByText(LOGIN_WARNING)).toBeInTheDocument();
    expect(navigate).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole("button", { name: "Close" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());

    await userEvent.click(container.querySelector("svg.text-3xl") as Element);
    expect(await screen.findByRole("dialog")).toHaveTextContent(LOGIN_WARNING);
    expect(screen.queryByText("Báo cáo người dùng")).toBeNull();
  });

  it("copies the profile link without the photos tab", async () => {
    mockEndpoint("get", PROFILE_URL, profile);
    window.history.pushState({}, "", "/user/ptg-1/photos");
    const user = userEvent.setup();
    const writeText = vi
      .spyOn(navigator.clipboard, "writeText")
      .mockResolvedValue(undefined);
    const { container } = renderProfile();
    await screen.findByText("Nhiếp Ảnh");

    await user.click(container.querySelector(".lucide-share2, .lucide-share-2") as Element);

    expect(await screen.findByText("Thành công")).toBeInTheDocument();
    expect(writeText).toHaveBeenCalledWith(`${window.location.origin}/user/ptg-1`);
    window.history.pushState({}, "", "/");
  });

  it("shows an error when the link cannot be copied", async () => {
    mockEndpoint("get", PROFILE_URL, profile);
    const user = userEvent.setup();
    const failure = new Error("denied");
    vi.spyOn(navigator.clipboard, "writeText").mockRejectedValue(failure);
    const { container } = renderProfile();
    await screen.findByText("Nhiếp Ảnh");

    await user.click(container.querySelector(".lucide-share2, .lucide-share-2") as Element);

    expect(
      await screen.findByText("Không thể copy link, vui lòng thử lại."),
    ).toBeInTheDocument();
    expect(consoleError).toHaveBeenCalledWith("Lỗi khi copy link:", failure);
    consoleError.mockClear();
  });

  it("sends users viewing their own profile to the profile page", async () => {
    auth.sub = "ptg-1";
    mockEndpoint("get", PROFILE_URL, profile);

    renderProfile("ptg-1");

    await screen.findByText("Nhiếp Ảnh");
    expect(navigate).toHaveBeenCalledWith("/profile");
  });

  it("renders an empty header when the profile cannot be loaded", async () => {
    let answered = false;
    server.use(
      http.get(PROFILE_URL, () => {
        answered = true;
        return new HttpResponse(null, { status: 500 });
      }),
    );
    const { container } = renderProfile();

    await waitFor(() => expect(answered).toBe(true));
    await waitFor(() => expect(screen.queryByText("Loading...")).toBeNull());
    expect(screen.queryByRole("button", { name: /Theo dõi/ })).toBeNull();

    // the report form still opens, with no photographer to reference
    await userEvent.click(container.querySelector("svg.text-3xl") as Element);
    expect(screen.getByText("Báo cáo người dùng")).toBeInTheDocument();
  });
});

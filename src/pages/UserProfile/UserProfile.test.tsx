import { fireEvent, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import type { MockInstance } from "vitest";
import { renderWithProviders } from "../../test/render";
import { server } from "../../test/server";
import { mockEndpoint } from "../../test/mockEndpoint";
import useModalStore from "../../states/UseModalStore";
import { FormatDateTime } from "../../utils/FormatDateTimeUtils";
import UserProfile from "./UserProfile";

const navigate = vi.hoisted(() => vi.fn());

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-router-dom")>()),
  useNavigate: () => navigate,
}));

vi.mock("../../services/Keycloak", () => ({
  default: { isLoggedIn: () => false, getToken: () => undefined },
}));

// the profile form has its own tests
vi.mock("../../components/ProfileDetail/UpdateProfileModal", () => ({
  default: ({ userData }: { userData: { name: string } }) => (
    <div>update form for {userData.name}</div>
  ),
}));

const NOW = new Date(2026, 8, 15, 12);
const EXPIRED_AT = new Date(2026, 8, 25, 12).toISOString();

const profile = {
  id: "u1",
  name: "Minh Anh",
  avatar: "https://cdn.test/avatar.jpg",
  cover: "https://cdn.test/cover.jpg",
  location: "Đà Lạt",
  quote: "Yêu nhiếp ảnh",
  mail: "minh@test.vn",
  phonenumber: "0901234567",
  _count: { photos: 1500000, followers: 2500, followings: 12 },
};

const renderProfile = () =>
  renderWithProviders(<UserProfile />, { route: "/profile/u1", path: "/profile/:userId" });

describe("UserProfile", () => {
  let consoleError: MockInstance<typeof console.error>;

  beforeEach(() => {
    consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    navigate.mockReset();
    useModalStore.setState({ isUpdateProfileModalVisible: false });
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
    const unexpected = consoleError.mock.calls.map((args) => args.map(String).join(" "));
    consoleError.mockRestore();
    expect(unexpected.join("\n")).toBe("");
  });

  it("shows the photographer profile with the upgrade package", async () => {
    mockEndpoint("get", "*/me", profile);
    mockEndpoint("get", "*/me/current-upgrade-package", {
      expiredAt: EXPIRED_AT,
      upgradePackageHistory: { name: "Gói Pro" },
    });

    const { container } = renderProfile();

    expect(container.querySelector(".ant-skeleton")).not.toBeNull();
    expect(await screen.findByText("Minh Anh")).toBeInTheDocument();
    expect(screen.getByAltText("Cover")).toHaveAttribute("src", profile.cover);
    expect(screen.getByAltText("Profile")).toHaveAttribute("src", profile.avatar);
    expect(screen.getByText("Đà Lạt")).toBeInTheDocument();
    expect(screen.getByText("Yêu nhiếp ảnh")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "minh@test.vn" })).toHaveAttribute(
      "href",
      "mailto:minh@test.vn",
    );
    expect(screen.getByText("0901234567")).toBeInTheDocument();
    expect(screen.getByText("1,50 tr")).toBeInTheDocument();
    expect(screen.getByText("2,50 ng")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("update form for Minh Anh")).toBeInTheDocument();

    expect(screen.getByText("Nhiếp ảnh gia gói: Gói Pro")).toBeInTheDocument();
    expect(screen.getByText(FormatDateTime(EXPIRED_AT))).toBeInTheDocument();
    expect(screen.getByText("10 ngày")).toBeInTheDocument();
    expect(container.querySelector(".ant-skeleton")).toBeNull();

    await userEvent.click(screen.getByText("Nhiếp ảnh gia gói: Gói Pro"));
    expect(navigate).toHaveBeenCalledWith("/upgrade");
  });

  it("offers the upgrade to users without a package", async () => {
    mockEndpoint("get", "*/me", {
      id: "u1",
      name: "Khách",
      location: "",
      mail: "",
      phonenumber: "",
      _count: { photos: 1000000, followers: 0 },
    });
    mockEndpoint("get", "*/me/current-upgrade-package", {});

    renderProfile();

    await userEvent.click(await screen.findByText("Nâng cấp thành nhiếp ảnh gia"));
    expect(navigate).toHaveBeenCalledWith("/upgrade");
    expect(screen.getByText("1 tr")).toBeInTheDocument();
    expect(screen.getByText("0")).toBeInTheDocument();
    expect(screen.queryByRole("link")).toBeNull();
    expect(screen.queryByText("Còn lại:")).toBeNull();
  });

  it("shows the package loading error", async () => {
    mockEndpoint("get", "*/me", profile);
    server.use(
      http.get(
        "*/me/current-upgrade-package",
        () => new HttpResponse(null, { status: 500 }),
      ),
    );

    renderProfile();

    expect(
      await screen.findByText("Error: Request failed with status code 500"),
    ).toBeInTheDocument();
  });

  it("keeps the skeleton while the profile loads", async () => {
    let answer: () => void = () => {};
    const answered = new Promise<void>((resolve) => {
      answer = resolve;
    });
    server.use(
      http.get("*/me", async () => {
        await answered;
        return HttpResponse.json(profile);
      }),
    );
    let packageSent = false;
    server.use(
      http.get("*/me/current-upgrade-package", () => {
        packageSent = true;
        return HttpResponse.json({});
      }),
    );

    const { container } = renderProfile();

    await waitFor(() => expect(packageSent).toBe(true));
    await waitFor(() =>
      expect(screen.queryByText("Nâng cấp thành nhiếp ảnh gia")).toBeNull(),
    );
    expect(container.querySelector(".ant-skeleton")).not.toBeNull();
    answer();
    expect(await screen.findByText("Minh Anh")).toBeInTheDocument();
  });

  it("copies the profile link", async () => {
    mockEndpoint("get", "*/me", profile);
    mockEndpoint("get", "*/me/current-upgrade-package", {});
    const user = userEvent.setup();
    const writeText = vi
      .spyOn(navigator.clipboard, "writeText")
      .mockResolvedValue(undefined);
    const { container } = renderProfile();
    await screen.findByText("Minh Anh");

    await user.click(container.querySelector(".rounded-full.hover\\:cursor-pointer") as HTMLElement);

    expect(await screen.findByText("Sao chép thành công")).toBeInTheDocument();
    expect(writeText).toHaveBeenCalledWith(`${window.location.origin}/user/u1`);
  });

  it("tells the user when the link cannot be copied", async () => {
    mockEndpoint("get", "*/me", profile);
    mockEndpoint("get", "*/me/current-upgrade-package", {});
    const user = userEvent.setup();
    const failure = new Error("denied");
    vi.spyOn(navigator.clipboard, "writeText").mockRejectedValue(failure);
    const { container } = renderProfile();
    await screen.findByText("Minh Anh");

    await user.click(container.querySelector(".rounded-full.hover\\:cursor-pointer") as HTMLElement);

    expect(
      await screen.findByText("Sao chép không thành công"),
    ).toBeInTheDocument();
    expect(consoleError).toHaveBeenCalledWith("Error copying link: ", failure);
    consoleError.mockClear();
  });

  it("opens the profile editor", async () => {
    mockEndpoint("get", "*/me", profile);
    mockEndpoint("get", "*/me/current-upgrade-package", {});
    renderProfile();

    await userEvent.click(await screen.findByText("Cập nhật hồ sơ"));

    expect(useModalStore.getState().isUpdateProfileModalVisible).toBe(true);
  });

  it("follows the window scroll and stops when unmounted", async () => {
    mockEndpoint("get", "*/me", profile);
    mockEndpoint("get", "*/me/current-upgrade-package", {});
    const removeListener = vi.spyOn(window, "removeEventListener");
    const { unmount } = renderProfile();
    await screen.findByText("Minh Anh");

    for (const scrollY of [120, 600]) {
      Object.defineProperty(window, "scrollY", { value: scrollY, configurable: true });
      fireEvent.scroll(window);
    }
    expect(screen.getByText("Minh Anh")).toBeInTheDocument();

    unmount();
    expect(removeListener).toHaveBeenCalledWith("scroll", expect.any(Function));
    removeListener.mockRestore();
    Object.defineProperty(window, "scrollY", { value: 0, configurable: true });
  });
});
